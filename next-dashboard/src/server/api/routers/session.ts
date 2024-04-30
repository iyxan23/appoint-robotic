import { z } from "zod";
import { createTRPCRouter, privateProcedure, publicProcedure } from "../trpc";
import { SESSION_TAG } from "./_tags";
import { contextSetSession, schemaSession } from "~/server/session";
import { eq } from "drizzle-orm";
import { users } from "~/server/db/schema";
import { compare, hashSync } from "bcryptjs";
import { cache } from "react";

export const sessionRouter = createTRPCRouter({
  getSession: publicProcedure
    .meta({ openapi: { method: "GET", path: "/session", tags: [SESSION_TAG] } })
    .input(z.undefined())
    .output(schemaSession.nullable())
    .query(async ({ ctx }) => {
      return ctx.session;
    }),

  login: publicProcedure
    .meta({ openapi: { method: "POST", path: "/login", tags: [SESSION_TAG] } })
    .input(z.object({ username: z.string(), password: z.string() }))
    .output(
      z.discriminatedUnion("success", [
        z.object({ success: z.literal(true), session: schemaSession }),
        z.object({ success: z.literal(false), reason: z.string() }),
      ]),
    )
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.username, input.username),
      });

      if (!user) {
        // to prevent timing attacks
        await compare(input.password, alreadyHashed());
        return { success: false, reason: "Invalid credentials" };
      }

      if (!(await compare(input.password, user.password))) {
        return { success: false, reason: "Invalid credentials" };
      }

      const session = {
        id: user.id,
        username: user.username,
        kind: "user" as const,
      };

      await contextSetSession(ctx, session);
      return { success: true, session: session };
    }),

  logout: privateProcedure
    .meta({ openapi: { method: "POST", path: "/logout", tags: [SESSION_TAG] } })
    .input(z.undefined())
    .output(z.undefined())
    .mutation(async ({ ctx }) => {
      await contextSetSession(ctx, null);
      return;
    }),
});

// used to prevent timing attacks
const alreadyHashed = cache(() => hashSync("password", 12));
