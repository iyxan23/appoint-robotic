import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { setOffset } from "~/time/time";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const date = (
    await req
      .json()
      .then((r) => z.object({ date: z.coerce.date() }).parseAsync(r))
  ).date;

  setOffset(new Date(), date);
  return NextResponse.json({ success: true });
}
