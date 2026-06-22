import { z } from "zod";

export const issueSchema = z.object({
  number: z.number(),
  title: z.string(),
  url: z.url(),
  state: z.string(),
  body: z.string().nullable().optional(),
  createdAt: z.iso.datetime(),
});

export type Issue = z.infer<typeof issueSchema>;
