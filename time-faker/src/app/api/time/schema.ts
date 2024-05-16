import { z } from "zod";

export const schemaTimeGetResponse = z.object({
  date: z.coerce.date()
});

export type TimeGetResponse = z.infer<typeof schemaTimeGetResponse>;
