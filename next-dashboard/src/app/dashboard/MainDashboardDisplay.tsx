"use client";

import { format, getHours, getMinutes } from "date-fns";
import { Armchair, HeartHandshake, UserIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { WORK_END_HOUR, WORK_START_HOUR } from "~/lib/constants";
import useStubbedNow from "~/lib/hooks/useStubbedNow";
import type { schemaSchedule, schemaTime } from "~/lib/schemas/schedule";
import { dateToScheduleDate } from "~/lib/utils";
import { TimeFaker } from "~/lib/timeFaker";
import { api } from "~/trpc/react";
import useSocket from "~/lib/socket/useSocket";
import CheckInPanel from "./CheckInPanel";

export default function MainDashboardDisplay({
  timeFakerHost,
  nfcReaderSecret,
}: {
  timeFakerHost?: string;
  nfcReaderSecret: string;
}) {
  const [timeFaker] = useState(() =>
    timeFakerHost ? new TimeFaker(timeFakerHost) : null,
  );
  const { now } = useStubbedNow(timeFaker);
  const socket = useSocket();

  const today = dateToScheduleDate(now);
  const utils = api.useUtils();
  const { data } = api.schedule.getSchedule.useQuery(today);
  const { mutate } = api.schedule.updateScheduleStatus.useMutation({
    onSuccess: () => {
      utils.schedule.getSchedule.invalidate(today);
    },
  });

  const dataFilled = useMemo(
    () => (data ? fillEmptyTimes(data) : undefined),
    [data],
  );

  useEffect(() => {
    socket.on("scheduleUpdate", async (data) => {
      const { year, month, day } = await z
        .object({ year: z.number(), month: z.number(), day: z.number() })
        .parseAsync(data);
      utils.schedule.getSchedule.invalidate({ year, month, day });
      utils.schedule.listSchedules.invalidate();
    });

    socket.on("checkInUpdate", async (data) => {
      const { id } = await z
        .object({
          id: z.number(),
        })
        .parseAsync(data);

      if (data.id === id) {
        utils.schedule.getSchedule.invalidate(today);
        utils.schedule.listSchedules.invalidate();
      }
    });
  });

  // find the appropriate schedule for today
  const work = useMemo(() => {
    if (dataFilled) {
      const found = findScheduleAssociatedToTime(
        { hour: getHours(now), minute: getMinutes(now) },
        dataFilled,
      );

      return found
        ? {
            status: "loaded" as const,
            data: found[0],
            index: found[1],
            previous: dataFilled[found[1] - 1],
            next: dataFilled[found[1] + 1],
          }
        : { status: "empty" as const };
    }

    return { status: "loading" as const };
  }, [dataFilled, now]);

  return (
    <div className="flex flex-col gap-4">
      <p>
        {getHours(now).toString().padStart(2, "0")}:
        {getMinutes(now).toString().padStart(2, "0")}{" "}
        {format(now, "dd MMM yyyy")}{" "}
      </p>
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
                        : work.data.type === "empty"
                          ? "Tidak ada"
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
                <Skeleton className="ml-auto h-5 w-16" />
              )}
            </div>
          )}
        </CardContent>
        <hr />
        <CardFooter className="flex flex-row justify-between rounded-b-lg bg-muted py-4">
          {work.status === "loaded" ? (
            <>
              <div className="text-sm text-muted-foreground">
                {work.previous ? (
                  work.previous.type === "appointment" ? (
                    `Sebelumnya: ${work.previous.title}`
                  ) : (
                    "Sebelumnya: Istirahat"
                  )
                ) : (
                  <>&nbsp;</>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {work.next ? (
                  work.next.type === "appointment" ? (
                    `Selanjutnya: ${work.next.title}`
                  ) : (
                    "Selanjutnya: Istirahat"
                  )
                ) : (
                  <>&nbsp;</>
                )}
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

      {work.data != null && work.data.type === "appointment" ? (
        <Card>
          <CardHeader className="font-semibold">
            Panel {work.data.title}
          </CardHeader>
          <CardContent className="grid grid-cols-3">
            <div className="flex flex-row gap-2">
              <UserIcon />
              <p>{work.data.patient.name}</p>
            </div>
            <div className="flex flex-row gap-2">
              Status:
              <span
                className={`font-semibold ${
                  {
                    appointed: "text-red-600",
                    "checked-in": "text-yellow-600",
                    "in-progress": "text-lime-600",
                    finished: "text-green-600",
                  }[work.data.status]
                }`}
              >
                {
                  {
                    appointed: "Belum Datang",
                    "checked-in": "Menunggu",
                    "in-progress": "Di Ruangan",
                    finished: "Selesai",
                  }[work.data.status]
                }
              </span>
            </div>
            <div className="flex flex-row justify-end gap-4">
              <Button
                onClick={() => {
                  if (work.data.type !== "appointment") return;
                  mutate({ id: work.data.id, status: "in-progress" });
                }}
                disabled={work.data.status !== "checked-in"}
              >
                Mulai
              </Button>
              <Button
                onClick={() => {
                  if (work.data.type !== "appointment") return;
                  mutate({ id: work.data.id, status: "finished" });
                }}
                disabled={work.data.status !== "in-progress"}
              >
                Selesai
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <></>
      )}
      {work.data != null && work.data.type === "appointment" ? (
        <CheckInPanel
          nfcReaderSecret={nfcReaderSecret}
          scheduleId={work.data.id}
          patientId={work.data.patient.id}
        />
      ) : (
        <></>
      )}
    </div>
  );
}

function findScheduleAssociatedToTime(
  { hour, minute }: { hour: number; minute: number },
  schedules: (
    | z.infer<typeof schemaSchedule>
    | {
        type: "empty";
        start: z.infer<typeof schemaTime>;
        end: z.infer<typeof schemaTime>;
      }
  )[],
):
  | [
      (
        | z.infer<typeof schemaSchedule>
        | {
            type: "empty";
            start: z.infer<typeof schemaTime>;
            end: z.infer<typeof schemaTime>;
          }
      ),
      number,
    ]
  | null {
  const time = hour * 1000 + minute;
  const foundIndex = schedules.findIndex(
    (s) =>
      s.start.hour * 1000 + s.start.minute < time &&
      s.end.hour * 1000 + s.start.minute > time,
  );

  // biome-ignore lint/style/noNonNullAssertion: foundIndex is the return value of findIndex
  return foundIndex !== -1 ? [schedules[foundIndex]!, foundIndex] : null;
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
