import { z } from "zod";

export const schemaDate = z.object({
  year: z.number(),
  month: z.number(),
  day: z.number(),
});

export const schemaTime = z.object({
  hour: z.number(),
  minute: z.number(),
});

export const schemaScheduleStatus = z.union([
  z.literal("appointed"),
  z.literal("in-progress"),
  z.literal("checked-in"),
  z.literal("finished"),
]);

export const schemaScheduleAppointment = z.object({
  type: z.literal("appointment"),

  id: z.number(),
  patientId: z.number(),
  title: z.string(),

  status: schemaScheduleStatus,
  start: schemaTime,
  end: schemaTime,
});

export const schemaScheduleBreak = z.object({
  type: z.literal("break"),

  id: z.number(),

  start: schemaTime,
  end: schemaTime,
});

export const schemaSchedule = z.discriminatedUnion("type", [
  schemaScheduleAppointment,
  schemaScheduleBreak,
]);
