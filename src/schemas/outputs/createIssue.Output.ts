import { z } from "zod";
import { createIssueSchema } from "../inputs/createIssueInput.js";

export const CreateIssueOutputSchema = z.object({
  ok: z.literal(true),
  data: createIssueSchema,
});

export type CreateIssueOutput = z.infer<typeof CreateIssueOutputSchema>;
