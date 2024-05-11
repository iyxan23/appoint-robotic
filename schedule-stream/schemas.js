import { z } from "zod";

export const schemaScheduleUpdate = z.object({
  year: z.number(),
  month: z.number(),
  day: z.number(),

  challange: z.string(),
});

export const schemaCheckInUpdate = z.object({
  id: z.number(),
  status: z.union([
    z.literal("checked-in"),
    z.literal("in-progress"),
    z.literal("finished"),
  ]),
  patientId: z.number()
});
