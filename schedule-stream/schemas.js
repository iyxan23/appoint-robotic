import { z } from "zod";

export const schemaScheduleUpdate = z.object({
  year: z.number(),
  month: z.number(),
  day: z.number(),

  challange: z.string(),
});
