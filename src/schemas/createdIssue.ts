import { z } from "zod";

export const createdIssueSchema = z.object({
  number: z.number(),
  url: z.url(),
  title: z.string(),
});

export type CreatedIssue = z.infer<typeof createdIssueSchema>;
