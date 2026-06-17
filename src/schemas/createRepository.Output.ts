import { z } from "zod";
import { repositorySchema } from "./repository.js";
import { issueSchema } from "./issue.js";

export const CreateRepositoryOutputSchema = z.object({
  ok: z.literal(true),
  data: issueSchema,
});

export type CreateIssueOutput = z.infer<typeof CreateRepositoryOutputSchema>;
