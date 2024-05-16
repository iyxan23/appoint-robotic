import { NextResponse } from "next/server";
import { TimeGetResponse } from "./schema";
import { getOffsettedTime } from "~/time/time";

export async function GET(): Promise<NextResponse<TimeGetResponse>> {
  return NextResponse.json({ date: getOffsettedTime(new Date()) });
}
