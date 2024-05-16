import "server-only";
import { fromUnixTime } from "date-fns/fromUnixTime";
import { getUnixTime } from "date-fns/getUnixTime";

const theGlobal = (globalThis as unknown as { offsetSecs: number });
theGlobal.offsetSecs = 0;

export var offsetSecs = theGlobal.offsetSecs;

export function getOffsettedTime(now: Date): Date {
  return fromUnixTime(getUnixTime(now) + theGlobal.offsetSecs);
}

export function setOffset(now: Date, offsetted: Date) {
  const offset = getUnixTime(offsetted) - getUnixTime(now);
  theGlobal.offsetSecs = offset;
}
