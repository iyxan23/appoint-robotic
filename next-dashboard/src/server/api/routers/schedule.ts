import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { SCHEDULE_TAG } from "./_tags";
import { schemaDate, schemaSchedule, schemaScheduleAppointment, schemaScheduleBreak, schemaScheduleStatus } from "~/lib/schemas/schedule";
import { between, eq, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { schedule } from "~/server/db/schema";

export const scheduleRouter = createTRPCRouter({
  listSchedules: privateProcedure
    .meta({ openapi: { method: "GET", path: "/schedule/list", tags: [SCHEDULE_TAG] } })
    .input(z.object({ range: z.object({ start: schemaDate, end: schemaDate }) }))
    // { year: { month: { day: schedule[] } } }
    .output(z.record(z.number(), z.record(z.number(), z.record(z.number(), schemaSchedule.array()))))
    .query(async ({ input: { range }, ctx }) => {
      // it's a bit awkward but we're going to workaround the problem that its a bit difficult to
      // do a comparison between three nested numbers, because it is not a simple `gt` or `lt` comparison

      // It has a some kind of hirearchy. The year takes priority over month, month takes priority over date, etc.
      // So I asked an AI, it gave an interesting solution of multiplying the year by 1000s and month by 100s.
      // so that's cool
      const start = range.start.year * 1000 + range.start.month * 100 + range.start.day;
      const end = range.end.year * 1000 + range.end.month * 100 + range.end.day;

      if (end < start) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "range.start should not be larger than range.end" });
      }

      const dbSchedules = await ctx.db
        .select()
        .from(schedule)
        .where(between(
          sql`${schedule.dateYear} * 1000 + ${schedule.dateMonth} * 100 + ${schedule.dateDay}`,
          start, end
        ));

      const schedules: (z.infer<typeof schemaSchedule> & { date: z.infer<typeof schemaDate> })[] =
        dbSchedules.map(convertDbScheduleToSchedule);

      // a messy code,
      // but it is rather simple, it essentially builds up the tree { year: { month: { day: schedule []}}}
      // by utilizing the `.date` field inside each schedule.
      const result = schedules.reduce((acc, { date: { year, month, day }, ...schedule }) => {
        if (!acc[year]) acc[year] = { [month]: { [day]: [schedule] } };
        else if (!acc?.[year]?.[month]) acc[year] = { ...acc[year], [month]: { [day]: [schedule] } };
        else acc[year] = { ...acc[year], [month]: { ...acc[year]?.[month], [day]: [schedule] } }
        return acc;
      }, {} as Record<number, Record<number, Record<number, z.infer<typeof schemaSchedule>[]>>>)

      return result;
    }),

  createSchedule: privateProcedure
    .meta({ openapi: { method: "POST", path: "/schedule/create", tags: [SCHEDULE_TAG] } })
    .input(z.discriminatedUnion("type", [
      schemaScheduleAppointment.omit({ id: true, status: true }).extend({ date: schemaDate }),
      schemaScheduleBreak.omit({ id: true }).extend({ date: schemaDate })
    ]))
    .output(schemaSchedule)
    .mutation(async ({ input, ctx }) => {
      // TODO
      // might be a good idea to do some checking to make sure the new schedule
      // doesn't overlap with other schedules.
      //
      // maybe doing something like this might work:
      //    SELECT COUNT(*) 
      //    FROM schedule s
      //    WHERE
      //      ${startHour * 100 + startMinutes} BETWEEN
      //        s.startHour * 100 + s.startMinutes AND 
      //        s.endHour * 100 + s.endMinutes
      //      OR
      //      ${endHour * 100 + endMinutes} BETWEEN
      //        s.startHour * 100 + s.startMinutes AND
      //        s.endHour * 100 + s.endMinutes
      const createdSchedule = await ctx.db.insert(schedule).values({
        dateYear: input.date.year,
        dateMonth: input.date.month,
        dateDay: input.date.day,

        startHour: input.start.hour,
        startMinute: input.start.minute,

        endHour: input.end.hour,
        endMinute: input.end.minute,

        isBreak: input.type === "break",

        patientId: input.type === "appointment" ? input.patientId : null,
        title: input.type === "appointment" ? input.title : null,
        status: input.type === "appointment" ? "appointed" : null,
      }).returning();

      const newSchedule = createdSchedule[0];
      if (!newSchedule) throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: "unable to create the schedule as requested"
      });

      return convertDbScheduleToSchedule(newSchedule);
    }),

  updateScheduleStatus: privateProcedure
    .meta({ openapi: { method: "POST", path: "/schedule/updateStatus", tags: [SCHEDULE_TAG] } })
    .input(z.object({ id: z.number(), status: schemaScheduleStatus }))
    .output(schemaSchedule)
    .mutation(async ({ input, ctx }) => {
      const updated = await ctx.db
        .update(schedule)
        .set({ status: input.status })
        .where(eq(schedule.id, input.id)).returning();

      const updatedSchedule = updated[0];
      if (!updatedSchedule) {
        throw new TRPCError({ code: 'NOT_FOUND', message: `no schedule with id ${input.id} found` });
      }

      return convertDbScheduleToSchedule(updatedSchedule);
    })
});

function convertDbScheduleToSchedule(
  ds: typeof schedule.$inferSelect
): z.infer<typeof schemaSchedule> & { date: z.infer<typeof schemaDate> } {
  return ds.isBreak ? {
    type: "break",
    date: { year: ds.dateYear, month: ds.dateMonth, day: ds.dateDay },
    id: ds.id,

    start: { hour: ds.startHour, minute: ds.startMinute },
    end: { hour: ds.endHour, minute: ds.endMinute },
  } : {
    type: "appointment",
    date: { year: ds.dateYear, month: ds.dateMonth, day: ds.dateDay },
    id: ds.id,

    start: { hour: ds.startHour, minute: ds.startMinute },
    end: { hour: ds.endHour, minute: ds.endMinute },

    patientId: ds.patientId ?? 1, // TODO - should've done a null assertion check but that'd be a bit too overkill
    title: ds.title ?? "Unknown title",
    status: ds.status,
  }
}