"use client";

import { useEffect, useState } from "react";
import DateSelector from "./DateSelector";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { schemaTimeGetResponse } from "./api/time/schema";

export default function TimeChanger() {
  const queryClient = useQueryClient();
  const { data: changedTime, isPending: timeIsPending } = useQuery({
    queryKey: ["changedTime"],
    queryFn: async () =>
      fetch("/api/time")
        .then((r) => r.json())
        .then((r) => schemaTimeGetResponse.parseAsync(r))
        .then((r) => r.date),
    staleTime: 1_000,
  });
  const { mutate, isPending: mutationIsPending } = useMutation({
    mutationFn: async (date: Date) => {
      await fetch("/api/time/set", {
        method: "POST",
        body: JSON.stringify({ date: date.toISOString() }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["changedTime"] });
    },
  });

  const [now, setNow] = useState(() => new Date());
  const [editedDate, setEditedDate] = useState(() => new Date());

  useEffect(() => {
    if (changedTime) setEditedDate(changedTime);
  }, [changedTime]);

  setInterval(() => {
    setNow(new Date());
  }, 1_000);

  return (
    <div className="grid grid-cols-[auto_1fr] gap-4">
      <p>Sekarang</p>
      <DateSelector date={now} dateChanged={() => { }} disabled />
      <p>Terubah</p>
      {changedTime ? (
        <DateSelector date={changedTime} dateChanged={() => { }} disabled />
      ) : (
        "Loading..."
      )}
      <p>&nbsp;</p>
      <p>&nbsp;</p>
      <p>Ubah:</p>
      {changedTime ? (
        <DateSelector
          date={editedDate}
          dateChanged={(newDate) => {
            setEditedDate(newDate);
          }}
          disabled={mutationIsPending}
        />
      ) : (
        "Loading..."
      )}
      <p>
        {mutationIsPending ? "Mengubah waktu..." : <>&nbsp;</>}
        {timeIsPending ? "Mengambil waktu..." : <>&nbsp;</>}
      </p>
      <div className="flex flex-row justify-end">
        <button
          disabled={mutationIsPending || timeIsPending}
          onClick={() => mutate(editedDate)}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Update Waktu
        </button>
      </div>
    </div>
  );
}
