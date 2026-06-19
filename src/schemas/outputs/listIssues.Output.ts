import z from "zod";
import { issueSchema } from "../issue.js";

export const listIssueOutputSchema = z.object({
  ok: z.literal(true),
  data: z.array(issueSchema),
});
export type ListissuesOutput = z.infer<typeof listIssueOutputSchema>;
