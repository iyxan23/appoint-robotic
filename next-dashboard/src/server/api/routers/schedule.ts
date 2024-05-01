import { z } from "zod";
import { createTRPCRouter, patientProcedure, userProcedure } from "../trpc";
import { SCHEDULE_TAG } from "./_tags";
import {
  schemaDate,
  schemaSchedule,
  schemaScheduleAppointment,
  schemaScheduleBreak,
  schemaScheduleStatus,
  schemaTime,
} from "~/lib/schemas/schedule";
import { and, between, eq, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { schedule } from "~/server/db/schema";
import {
  addDays,
  addWeeks,
  endOfDay,
  getDate,
  getMonth,
  getYear,
  startOfDay,
  subDays,
} from "date-fns";
import { WORK_END_HOUR, WORK_START_HOUR } from "~/lib/constants";

export const scheduleRouter = createTRPCRouter({
  listSchedules: userProcedure
    // .meta({
    //   openapi: { method: "GET", path: "/schedule/list", tags: [SCHEDULE_TAG] },
    // })
    .input(
      z.object({ range: z.object({ start: schemaDate, end: schemaDate }) }),
    )
    .output(
      z.record(
        z.coerce.number(),
        z.record(
          z.coerce.number(),
          z.record(z.coerce.number(), schemaSchedule.array()),
        ),
      ),
    )
    .query(async ({ input: { range }, ctx }) => {
      // it's a bit awkward but we're going to workaround the problem that its a bit difficult to
      // do a comparison between three nested numbers, because it is not a simple `gt` or `lt` comparison

      // It has a some kind of hirearchy. The year takes priority over month, month takes priority over date, etc.
      // So I asked an AI, it gave an interesting solution of multiplying the year by 1000s and month by 100s.
      // so that's cool
      const start =
        range.start.year * 10000 + range.start.month * 100 + range.start.day;
      const end =
        range.end.year * 10000 + range.end.month * 100 + range.end.day;

      if (end < start) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "range.start should not be larger than range.end",
        });
      }

      const wher = between(
        sql`${schedule.dateYear} * 10000 + ${schedule.dateMonth} * 100 + ${schedule.dateDay}`,
        start,
        end,
      );

      const dbSchedules = await ctx.db.query.schedule.findMany({
        where: wher,
      });

      const schedules = dbSchedules.map((ds) =>
        convertDbScheduleToSchedule(ds),
      );

      return nestSchedules(schedules);
    }),

  getSchedule: userProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/schedule/get",
        tags: [SCHEDULE_TAG],
      },
    })
    .input(schemaDate)
    .output(schemaSchedule.array())
    .query(async ({ input, ctx }) => {
      const wher = and(
        and(
          eq(schedule.dateYear, input.year),
          eq(schedule.dateMonth, input.month),
        ),
        eq(schedule.dateDay, input.day),
      );

      const dbSchedules = await ctx.db.query.schedule.findMany({
        where: wher,
        with: {
          patient: true,
        },
      });

      return dbSchedules.map(({ patient, ...ds }) =>
        convertDbScheduleToSchedule(
          ds,
          patient ? { id: patient.id, name: patient.username } : undefined,
        ),
      );
    }),

  createSchedule: userProcedure
    // .meta({
    //   openapi: {
    //     method: "POST",
    //     path: "/schedule/create",
    //     tags: [SCHEDULE_TAG],
    //   },
    // })
    .input(
      z.discriminatedUnion("type", [
        schemaScheduleAppointment
          .omit({ id: true, status: true })
          .extend({ date: schemaDate }),
        schemaScheduleBreak.omit({ id: true }).extend({ date: schemaDate }),
      ]),
    )
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
      const createdSchedule = await ctx.db
        .insert(schedule)
        .values({
          dateYear: input.date.year,
          dateMonth: input.date.month,
          dateDay: input.date.day,

          startHour: input.start.hour,
          startMinute: input.start.minute,

          endHour: input.end.hour,
          endMinute: input.end.minute,

          isBreak: input.type === "break",

          patientId: input.type === "appointment" ? input.patient.id : null,
          title: input.type === "appointment" ? input.title : null,
          status: input.type === "appointment" ? "appointed" : null,
        })
        .returning();

      const newSchedule = createdSchedule[0];
      if (!newSchedule)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "unable to create the schedule as requested",
        });

      return convertDbScheduleToSchedule(newSchedule);
    }),

  deleteSchedule: userProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/schedule/delete",
        tags: [SCHEDULE_TAG],
      },
    })
    .input(z.object({ id: z.number() }))
    .output(schemaSchedule)
    .mutation(async ({ input, ctx }) => {
      const deleted = await ctx.db
        .delete(schedule)
        .where(eq(schedule.id, input.id))
        .returning();

      const deletedSchedule = deleted[0];

      if (!deletedSchedule) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `no schedule with id ${input.id} found`,
        });
      }

      return convertDbScheduleToSchedule(deletedSchedule);
    }),

  updateScheduleStatus: userProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/schedule/updateStatus",
        tags: [SCHEDULE_TAG],
      },
    })
    .input(z.object({ id: z.number(), status: schemaScheduleStatus }))
    .output(schemaSchedule)
    .mutation(async ({ input, ctx }) => {
      const updated = await ctx.db
        .update(schedule)
        .set({ status: input.status })
        .where(eq(schedule.id, input.id))
        .returning();

      const updatedSchedule = updated[0];
      if (!updatedSchedule) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `no schedule with id ${input.id} found`,
        });
      }

      return convertDbScheduleToSchedule(updatedSchedule);
    }),

  listEmptySchedules: patientProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/schedule/listEmptySchedules",
        tags: [SCHEDULE_TAG],
      },
    })
    .input(z.undefined())
    .output(
      z.array(
        z.object({
          date: schemaDate,
          emptyTimes: z.array(z.object({ start: schemaTime, end: schemaTime })),
        }),
      ),
    )
    .query(async ({ ctx }) => {
      // gets the schedules one week ahead
      // not including today (that's why the addDays 1)
      const tomorrow = addDays(startOfDay(new Date()), 1);
      const oneWeekAhead = subDays(endOfDay(addWeeks(tomorrow, 1)), 1);
      const start =
        getYear(tomorrow) * 10000 +
        getMonth(tomorrow) * 100 +
        getDate(tomorrow);
      const end =
        getYear(oneWeekAhead) * 10000 +
        getMonth(oneWeekAhead) * 100 +
        getDate(oneWeekAhead);

      const wher = between(
        sql`${schedule.dateYear} * 10000 + ${schedule.dateMonth} * 100 + ${schedule.dateDay}`,
        start,
        end,
      );

      const schedules = await ctx.db.query.schedule.findMany({ where: wher });

      const filledWithSchedule: {
        start: z.infer<typeof schemaTime>;
        end: z.infer<typeof schemaTime>;
      }[][] = Array.from({ length: 7 }).map(() => []);

      for (const s of schedules) {
        const date = s.dateYear * 10000 + s.dateMonth * 100 + s.dateDay;
        const dateRelativeToWeek = date - start;

        // biome-ignore lint/style/noNonNullAssertion: it shouldn't be
        filledWithSchedule[dateRelativeToWeek]!.push({
          start: { hour: s.startHour, minute: s.startMinute },
          end: { hour: s.endHour, minute: s.endMinute },
        });
      }

      // find the times in filledWithSchedule that is empty, starting from WORK_START_HOUR to WORK_END_HOUR

      const emptyTimes: {
        date: z.infer<typeof schemaDate>;
        emptyTimes: {
          start: z.infer<typeof schemaTime>;
          end: z.infer<typeof schemaTime>;
        }[];
      }[] = [];
      let nthDay = 0;

      for (const day of filledWithSchedule) {
        const emptyHoursThisDay = [];
        let hour = WORK_START_HOUR;

        for (const { start, end } of day) {
          if (start.hour > hour) {
            emptyHoursThisDay.push({
              start: { hour, minute: 0 },
              end: { hour: start.hour, minute: 0 },
            });
          }

          hour = end.hour;
        }

        const thisDay = addDays(tomorrow, nthDay);
        emptyTimes.push({
          date: {
            year: getYear(thisDay),
            month: getMonth(thisDay),
            day: getDate(thisDay),
          },
          emptyTimes: emptyHoursThisDay,
        });

        nthDay++;
      }

      return emptyTimes;
    }),
});

function convertDbScheduleToSchedule(
  ds: typeof schedule.$inferSelect,
  patient?: { id: number; name: string },
): z.infer<typeof schemaSchedule> & { date: z.infer<typeof schemaDate> } {
  return ds.isBreak
    ? {
      type: "break",
      date: { year: ds.dateYear, month: ds.dateMonth, day: ds.dateDay },
      id: ds.id,

      start: { hour: ds.startHour, minute: ds.startMinute },
      end: { hour: ds.endHour, minute: ds.endMinute },
    }
    : {
      type: "appointment",
      date: { year: ds.dateYear, month: ds.dateMonth, day: ds.dateDay },
      id: ds.id,

      start: { hour: ds.startHour, minute: ds.startMinute },
      end: { hour: ds.endHour, minute: ds.endMinute },

      patient: patient ?? { name: "Unknown patient", id: 1 }, // TODO - should've done a null assertion check but that'd be a bit too overkill
      title: ds.title ?? "Unknown title",
      status: ds.status ?? "finished",
    };
}

function nestSchedules(
  schedules: (z.infer<typeof schemaSchedule> & {
    date: z.infer<typeof schemaDate>;
  })[],
): Record<
  number,
  Record<number, Record<number, z.infer<typeof schemaSchedule>[]>>
> {
  // transform the schedules into a tree of records
  const result: Record<
    number,
    Record<number, Record<number, z.infer<typeof schemaSchedule>[]>>
  > = {};

  for (const {
    date: { year, month, day },
    ...schedule
  } of schedules) {
    if (!result[year]) result[year] = { [month]: { [day]: [schedule] } };
    else if (!result[year]?.[month]) {
      // biome-ignore lint/style/noNonNullAssertion: see the code above
      result[year]![month] = { [day]: [schedule] };
      // biome-ignore lint/style/noNonNullAssertion: see the code above
    } else if (!result[year]![month]?.[day]) {
      // biome-ignore lint/style/noNonNullAssertion: see the code above
      result[year]![month]![day] = [];
    } else {
      // biome-ignore lint/style/noNonNullAssertion: see the code above
      result[year]![month]![day]!.push(schedule);
    }
  }

  return result;
}
