import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { checkin, schedule } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createHash } from "node:crypto";
import { env } from "~/env";

export const nfcRouter = createTRPCRouter({
  // this should only be able to be called by the nfc reader device
  doCheckIn: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/nfc/doCheckIn",
        tags: ["NFC"],
      },
    })
    .input(
      z.object({
        id: z.string(),
        challange: z.string(),
      }),
    )
    .output(z.undefined())
    .mutation(async ({ input, ctx }) => {
      // the request must pass a challange first
      const challange = input.challange;
      const payload = { ...input, challange: undefined };

      const theCheckin = await ctx.db.query.checkin.findFirst({
        where: eq(checkin.id, input.id),
      });

      if (!theCheckin) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const theSchedule = await ctx.db.query.schedule.findFirst({
        where: eq(schedule.id, theCheckin.scheduleId),
      });

      if (!theSchedule) {
        await ctx.db.delete(checkin).where(eq(checkin.id, theCheckin.id));
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await ctx.db
        .update(schedule)
        .set({ status: "checked-in" })
        .where(eq(schedule.id, theSchedule.id));

      if (!theSchedule.patientId) {
        console.error("no patientId found for schedule ", theSchedule);
        console.error("skipping /nfc/doCheckIn");
        return;
      }

      await ctx.notifier.sendCheckInUpdate(
        {
          id: theSchedule.id,
          status: "checked-in",
        },
        theSchedule.patientId,
      );
    }),
});
