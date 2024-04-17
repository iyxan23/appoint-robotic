"use client";

import { Calendar } from "~/components/ui/calendar";
import ScheduleTable from "./ScheduleTable";
import { id } from "date-fns/locale";
import { create } from "zustand";
import { format } from "date-fns";

const useSelectedDate = create<{ date: Date, setDate: (Date) => void }>((set) => ({
  date: new Date(),
  setDate: (date: Date) => set({ date }),
}))

export default function ScheduleDisplay() {
  const { date, setDate } = useSelectedDate();

  return <>
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
        <ScheduleTable data={[
          { type: "appointment", start: { hour: 16, minute: 0 }, end: { hour: 17, minute: 0 }, patient: "Azzam", title: "Sakit kepala atuh", status: "appointed" },
          { type: "appointment", start: { hour: 17, minute: 0 }, end: { hour: 18, minute: 30 }, patient: "Koriz", title: "Kaki bintul2 bro", status: "appointed" },
          { type: "break", start: { hour: 18, minute: 30 }, end: { hour: 19, minute: 0 } },
          { type: "appointment", start: { hour: 19, minute: 0 }, end: { hour: 19, minute: 30 }, patient: "Ridho", title: "Sakit mulut g bisa ngomong", status: "appointed" }
        ]} />
      </article>
    </div>
  </>
}
