"use client";

import { getHours, getMinutes } from "date-fns";
import { Armchair, HeartHandshake } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { z } from "zod";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import type { schemaSchedule } from "~/lib/schemas/schedule";
import { dateToScheduleDate } from "~/lib/utils";
import { api } from "~/trpc/react";

export default function MainDashboardDisplay() {
  const [now, setNow] = useState(() => new Date());
  const today = dateToScheduleDate(now);
  const { data } = api.schedule.getSchedule.useQuery(today);

  // find the appropriate schedule for today
  const work = useMemo(() => {
    if (data) {
      const found = findScheduleAssociatedToTime(
        { hour: getHours(now), minute: getMinutes(now) },
        data,
      );

      return found
        ? {
          status: "loaded" as const,
          data: found[0],
          index: found[1],
          previous: data[found[1] - 1],
          next: data[found[1] + 1],
        }
        : { status: "empty" as const };
    }

    return { status: "loading" as const };
  }, [data, now]);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30_000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>Sekarang</CardHeader>
        <CardContent>
          {work.status === "empty" ? (
            <>Hari telah berakhir!</>
          ) : (
            <div className="grid grid-cols-3">
              <div className="flex flex-row gap-3">
                {work.status === "loaded" ? (
                  <>
                    {work.data.type === "appointment" ? (
                      <HeartHandshake />
                    ) : (
                      <Armchair />
                    )}
                    <p className="font-semibold">
                      {work.data.type === "appointment"
                        ? work.data.title
                        : "Istirahat"}
                    </p>
                  </>
                ) : (
                  <Skeleton className="h-5 w-32" />
                )}
              </div>
              {work.status === "loaded" ? (
                <p className="text-muted-foreground">
                  {work.data.type === "appointment"
                    ? work.data.patient.name
                    : "Istirahat"}
                </p>
              ) : (
                <Skeleton className="h-5 w-24" />
              )}
              {work.status === "loaded" ? (
                <p className="text-right">
                  {work.data.start.hour.toString().padStart(2, "0")}:
                  {work.data.start.minute.toString().padStart(2, "0")}-
                  {work.data.end.hour.toString().padStart(2, "0")}:
                  {work.data.end.minute.toString().padStart(2, "0")}
                </p>
              ) : (
                <Skeleton className="h-5 w-16 ml-auto" />
              )}
            </div>
          )}
        </CardContent>
        <hr />
        <CardFooter className="flex flex-row justify-between py-4 bg-muted rounded-b-lg">
          {work.status === "loaded" ? (
            <>
              <div className="text-sm text-muted-foreground">
                {work.previous
                  ? work.previous.type === "appointment"
                    ? `Sebelumnya: ${work.previous.title}`
                    : "Sebelumnya: Istirahat"
                  : <>&nbsp;</>}
              </div>
              <div className="text-sm text-muted-foreground">
                {work.next
                  ? work.next.type === "appointment"
                    ? `Selanjutnya: ${work.next.title}`
                    : "Selanjutnya: Istirahat"
                  : <>&nbsp;</>}
              </div>
            </>
          ) : (
            <>
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16" />
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

function findScheduleAssociatedToTime(
  { hour, minute }: { hour: number; minute: number },
  schedules: z.infer<typeof schemaSchedule>[],
): [z.infer<typeof schemaSchedule>, number] | null {
  const time = hour * 1000 + minute;
  const foundIndex = schedules.findIndex(
    (s) =>
      s.start.hour * 1000 + s.start.minute < time &&
      s.end.hour * 1000 + s.start.minute > time,
  );

  // biome-ignore lint/style/noNonNullAssertion: foundIndex is the return value of findIndex
  return foundIndex !== -1 ? [schedules[foundIndex]!, foundIndex] : null;
}
