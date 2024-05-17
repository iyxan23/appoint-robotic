"use client";

import {
  addMonths,
  addWeeks,
  differenceInWeeks,
  endOfDay,
  endOfWeek,
  format,
  getDate,
  getMonth,
  getYear,
  startOfDay,
  subWeeks,
} from "date-fns";
import { id } from "date-fns/locale";
import { create } from "zustand";
import { Calendar } from "~/components/ui/calendar";
import { dateToScheduleDate } from "~/lib/utils";
import { api } from "~/trpc/react";
import ScheduleTable from "../ScheduleTable";
import { Skeleton } from "~/components/ui/skeleton";
import { schemaSchedule, schemaTime } from "~/lib/schemas/schedule";
import { z } from "zod";
import { WORK_END_HOUR, WORK_START_HOUR } from "~/lib/constants";
import { useMemo } from "react";

const useSelectedDate = create<{ date: Date; setDate: (date: Date) => void }>(
  (set) => ({
    date: new Date(),
    setDate: (date: Date) => set({ date }),
  }),
);

export default function ScheduleDisplay() {
  const { date, setDate } = useSelectedDate();

  let start = startOfDay(new Date());
  let end = endOfWeek(addWeeks(endOfDay(new Date()), 1));

  const less = date.valueOf() < start.valueOf();
  const over = date.valueOf() > end.valueOf();
  if (less || over) {
    const diff = differenceInWeeks(start, date);

    start = subWeeks(start, diff - (over ? 1 : -1));
    end = subWeeks(end, diff - (over ? 1 : -1));
  }

  const { data, isLoading } = api.schedule.listSchedules.useQuery({
    range: { start: dateToScheduleDate(start), end: dateToScheduleDate(end) },
  });

  const selectedDate = useMemo(() => data?.[getYear(date)]?.[getMonth(date)]?.[getDate(date)], [data, date]);

  const filledSelectedDate = useMemo(
    () => fillEmptyTimes(selectedDate ?? []),
    [selectedDate],
  );

  const filledSelectedDateMapped = useMemo(
    () =>
      filledSelectedDate.map((schedule) =>
        schedule.type === "appointment"
          ? { ...schedule, patient: schedule.patient.name ?? "Unknown Patient" }
          : { ...schedule },
      ),
    [filledSelectedDate],
  );

  return (
    <>
      <div className="grid gap-4 md:grid-cols-[auto_1fr]">
        <Calendar
          mode="single"
          className="rounded-md border h-min"
          locale={id}
          selected={date}
          onSelect={(d) => setDate(d ?? new Date())}
          toMonth={addMonths(new Date(), 1)}
        />
        <article className="flex flex-col gap-4">
          <h1>{format(date, "cccc, dd MMMM yyyy", { locale: id })}</h1>
          {isLoading ? (
            <div className="flex flex-col gap-4">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
          ) : (
            <ScheduleTable data={filledSelectedDateMapped} />
          )}
        </article>
      </div>
    </>
  );
}

// this function will fill empty times with a schedule object with type "empty"
function fillEmptyTimes(schedules: z.infer<typeof schemaSchedule>[]): (
  | z.infer<typeof schemaSchedule>
  | {
    type: "empty";
    start: z.infer<typeof schemaTime>;
    end: z.infer<typeof schemaTime>;
  }
)[] {
  const result: (
    | z.infer<typeof schemaSchedule>
    | {
      type: "empty";
      start: z.infer<typeof schemaTime>;
      end: z.infer<typeof schemaTime>;
    }
  )[] = [];
  let lastHour = WORK_START_HOUR;

  for (const i of schedules) {
    if (i.start.hour > lastHour) {
      result.push({
        type: "empty",
        start: { hour: lastHour, minute: 0 },
        end: { hour: i.start.hour, minute: 0 },
      });
    } else {
      result.push(i);
    }
    lastHour = i.end.hour;
  }

  if (lastHour < WORK_END_HOUR) {
    result.push({
      type: "empty",
      start: { hour: lastHour, minute: 0 },
      end: { hour: WORK_END_HOUR, minute: 0 },
    });
  }

  return result;
}
