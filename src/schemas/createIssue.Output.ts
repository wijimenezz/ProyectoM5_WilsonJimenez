import { z } from "zod";
import { createIssueSchema } from "./createIssue.js";

export const CreateIssueOutputSchema = z.object({
  ok: z.literal(true),
  data: createIssueSchema,
});
