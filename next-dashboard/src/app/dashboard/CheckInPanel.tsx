"use client";

import { createHash } from "crypto";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";

export default function CheckInPanel({
  nfcReaderSecret,
  scheduleId,
  patientId,
}: {
  nfcReaderSecret: string;
  scheduleId: number;
  patientId: number;
}) {
  const [uuid, setUuid] = useState<string | null>(null);
  const getCode = async () => {
    fetch(
      `/api/patient/acheckIn?patientId=${patientId}&scheduleId=${scheduleId}`,
      {
        method: "GET",
      },
    )
      .then((res) => res.json())
      .then((r) => setUuid(r.id));
  };
  const checkIn = async () => {
    fetch("/api/nfc/doCheckIn", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: uuid,
        challange: createHash("sha256")
          .update(JSON.stringify({ id: uuid }) + nfcReaderSecret)
          .digest("hex"),
      }),
    }).then(() => setUuid(null));
  };

  return (
    <Card>
      <CardHeader className="font-bold">Simulasi Check-in</CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Button onClick={() => getCode()} disabled={uuid !== null}>
          Check-In
        </Button>
        {uuid && (
          <>
            <p>Check-In UUID: {uuid}</p>
            <Button onClick={() => checkIn()}>Tap NFC</Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
