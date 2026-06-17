import { z } from "zod";

export const issueSchema = z.object({
  number: z.number(),
  title: z.string(),
  url: z.string().url(),
  state: z.string(),
  body: z.string().nullable(),
});

export type Issue = z.infer<typeof issueSchema>;
