import { z } from "zod";

export const schemaPatient = z.object({
  id: z.number(),
  username: z.string(),
})
