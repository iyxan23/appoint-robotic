import { type ClassValue, clsx } from "clsx";
import type { schemaDate } from "./schemas/schedule";
import type { z } from "zod";
import { twMerge } from "tailwind-merge";
import { getDate, getMonth, getYear } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function dateToScheduleDate(date: Date): z.infer<typeof schemaDate> {
  const year = getYear(date);
  const month = getMonth(date);
  const day = getDate(date);

  return { year, month, day };
}
