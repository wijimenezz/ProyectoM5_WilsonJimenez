import { z } from "zod";
import { createIssueSchema } from "./createIssue.js";

export const CreateIssueOutputSchema = z.object({
  ok: z.literal(true),
  data: createIssueSchema,
});

export type CreateIssueOutput = z.infer<typeof CreateIssueOutputSchema>;
