"use client";

import {
  addWeeks,
  endOfWeek,
  format,
  getDate,
  getMonth,
  getYear,
} from "date-fns";
import { id } from "date-fns/locale";
import { create } from "zustand";
import { Calendar } from "~/components/ui/calendar";
import { dateToScheduleDate } from "~/lib/utils";
import { api } from "~/trpc/react";
import ScheduleTable from "./ScheduleTable";
import { Skeleton } from "~/components/ui/skeleton";

const useSelectedDate = create<{ date: Date; setDate: (date: Date) => void }>(
  (set) => ({
    date: new Date(),
    setDate: (date: Date) => set({ date }),
  }),
);

export default function ScheduleDisplay() {
  const { date, setDate } = useSelectedDate();
  const { data, isLoading } = api.schedule.listSchedules.useQuery({
    range: {
      start: dateToScheduleDate(new Date()),
      end: dateToScheduleDate(endOfWeek(addWeeks(new Date(), 1))),
    },
  });

  const selectedDate = data?.[getYear(date)]?.[getMonth(date)]?.[
    getDate(date)
  ]?.map((schedule) =>
    schedule.type === "appointment"
      ? { ...schedule, patient: schedule.patient.name ?? "Unknown Patient" }
      : { ...schedule },
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
          toMonth={new Date()}
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
            <ScheduleTable
              data={selectedDate ?? []}
            />
          )}
        </article>
      </div>
    </>
  );
}
