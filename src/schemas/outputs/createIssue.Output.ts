import { z } from "zod";
import { createdIssueSchema } from "../createdIssue.js";

export const CreateIssueOutputSchema = z.object({
  ok: z.literal(true),
  data: createdIssueSchema,
});

export type CreateIssueOutput = z.infer<typeof CreateIssueOutputSchema>;
