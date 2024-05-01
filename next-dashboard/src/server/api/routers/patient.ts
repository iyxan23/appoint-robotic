import { z } from "zod";
import { createTRPCRouter, publicProcedure, userProcedure } from "../trpc";
import { contextSetSession, schemaSession } from "~/server/session";
import { eq } from "drizzle-orm";
import { patient } from "~/server/db/schema";
import { compare, hashSync } from "bcryptjs";
import { cache } from "react";
import { PATIENT_TAG } from "./_tags";
import { schemaPatient } from "~/lib/schemas/patient";

export const patientRouter = createTRPCRouter({
  login: publicProcedure
    .meta({
      openapi: { method: "POST", path: "/patient/login", tags: [PATIENT_TAG] },
    })
    .input(z.object({ username: z.string(), password: z.string() }))
    .output(
      z.discriminatedUnion("success", [
        z.object({ success: z.literal(true), session: schemaSession }),
        z.object({ success: z.literal(false), reason: z.string() }),
      ]),
    )
    .mutation(async ({ input, ctx }) => {
      const p = await ctx.db.query.patient.findFirst({
        where: eq(patient.username, input.username),
      });

      if (!p) {
        // used to prevent timing callbacks
        await compare(input.password, alreadyHashed());
        return { success: false, reason: "Invalid credentials" };
      }

      if (!(await compare(input.password, p.password))) {
        return { success: false, reason: "Invalid credentials" };
      }

      const session = {
        id: p.id,
        username: p.username,
        kind: "patient" as const,
      };
      await contextSetSession(ctx, session);

      return { success: true, session };
    }),

  register: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/patient/register",
        tags: [PATIENT_TAG],
      },
    })
    .input(z.object({ username: z.string(), password: z.string() }))
    .output(
      z.discriminatedUnion("success", [
        z.object({ success: z.literal(true), session: schemaSession }),
        z.object({ success: z.literal(false), reason: z.string() }),
      ]),
    )
    .mutation(async ({ input, ctx }) => {
      const p = await ctx.db.query.patient.findFirst({
        where: eq(patient.username, input.username),
      });

      if (p) {
        return { success: false, reason: "User already exists" };
      }

      const hashedPassword = hashSync(input.password, 12);

      const newPatient = await ctx.db
        .insert(patient)
        .values({ username: input.username, password: hashedPassword })
        .returning();

      const createdPatient = newPatient[0];
      if (!createdPatient) {
        return { success: false, reason: "Could not create user" };
      }

      const session = {
        id: createdPatient.id,
        username: createdPatient.username,
        kind: "patient" as const,
      };

      await contextSetSession(ctx, session);

      return { success: true, session };
    }),

  listPatients: userProcedure
    .meta({
      openapi: { method: "GET", path: "/patient/list", tags: [PATIENT_TAG] },
    })
    .input(z.undefined())
    .output(schemaPatient.array())
    .query(({ ctx }) => {
      return ctx.db
        .select({ id: patient.id, username: patient.username })
        .from(patient);
    }),
});

const alreadyHashed = cache(() => hashSync("password", 12));
