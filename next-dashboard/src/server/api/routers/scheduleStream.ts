import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { SCHEDULE_STREAM } from "./_tags";
import { createHash } from "node:crypto";
import { env } from "~/env";
import { TRPCError } from "@trpc/server";
import { unsealData } from "~/server/session";

export const scheduleStreamRouter = createTRPCRouter({
  verifyToken: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/scheduleStream/verifyToken",
        tags: [SCHEDULE_STREAM],
      },
    })
    .input(
      // nonce will be ignored, it is there for security to prevent replay attacks
      z.object({ token: z.string(), nonce: z.string(), challange: z.string() }),
    )
    .output(
      z.discriminatedUnion("valid", [
        z.object({
          valid: z.literal(true),
          kind: z.discriminatedUnion("type", [
            z.object({ type: z.literal("patient"), id: z.number() }),
            z.object({ type: z.literal("user") }),
          ]),
        }),
        z.object({ valid: z.literal(false) }),
      ]),
    )
    .query(async ({ input }) => {
      // verify the challange
      const challange = input.challange;
      const payload = { ...input, challange: undefined };
      if (
        createHash("sha256")
          .update(JSON.stringify(payload) + env.SCHEDULE_STREAM_SECRET)
          .digest("hex") !== challange
      ) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const token = input.token;
      let unsealed: Awaited<ReturnType<typeof unsealData>>;
      try {
        unsealed = await unsealData(token);
      } catch {
        return { valid: false as const };
      }

      return {
        valid: true as const,
        kind:
          unsealed.kind === "patient"
            ? {
              type: "patient",
              id: unsealed.id,
            }
            : {
              type: "user",
            },
      };
    }),
});
