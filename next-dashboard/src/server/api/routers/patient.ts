import { z } from "zod";
import {
  createTRPCRouter,
  patientProcedure,
  publicProcedure,
  userProcedure,
} from "../trpc";
import { contextSetSession, schemaSession } from "~/server/session";
import { and, eq } from "drizzle-orm";
import { checkin, patient, schedule } from "~/server/db/schema";
import { compare, hashSync } from "bcryptjs";
import { cache } from "react";
import { PATIENT_TAG } from "./_tags";
import { schemaPatient } from "~/lib/schemas/patient";
import {
  schemaSchedule,
  schemaScheduleAppointment,
} from "~/lib/schemas/schedule";
import { convertDbScheduleToSchedule } from "./schedule";
import { TRPCError } from "@trpc/server";

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

  listAppointments: patientProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/patient/appointments",
        tags: [PATIENT_TAG],
      },
    })
    .input(z.undefined())
    .output(schemaSchedule.array())
    .query(async ({ ctx }) => {
      const patientId = ctx.session.id;

      const schedules = await ctx.db.query.schedule.findMany({
        where: eq(schedule.patientId, patientId),
      });

      return schedules.map((s) =>
        convertDbScheduleToSchedule(s, {
          id: patientId,
          name: ctx.session.username,
        }),
      );
    }),

  getCheckInID: patientProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/patient/checkin",
        tags: [PATIENT_TAG],
      },
    })
    .input(z.object({ scheduleId: z.number() }))
    .output(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // check if schedule is at least 15 mins before new Date();
      const theSchedule = await ctx.db.query.schedule.findFirst({
        where: and(
          eq(schedule.id, input.scheduleId),
          eq(schedule.patientId, ctx.session.id),
        ),
      });

      if (!theSchedule) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const now = new Date();
      const nowMins = now.getHours() * 60 + now.getMinutes();

      const scheduleMins = theSchedule.startHour * 60 + theSchedule.startMinute;
      const diff = nowMins - scheduleMins;

      if (-diff > 15 || diff > 0) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const newCheckIn = await ctx.db
        .insert(checkin)
        .values({
          patientId: ctx.session.id,
          scheduleId: input.scheduleId,
          id: new Crypto().randomUUID(),
        }).returning();

      // biome-ignore lint/style/noNonNullAssertion: shouldn't be null, because we had just inserted it
      return { id: newCheckIn[0]!.id };
    }),
});

const alreadyHashed = cache(() => hashSync("password", 12));
