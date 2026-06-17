import { z } from "zod";
import { issueSchema } from "./issue.js";

export const CreateRepositoryOutputSchema = z.object({
  ok: z.literal(true),
  data: issueSchema,
});

export type CreateRepositoryOutput = z.infer<
  typeof CreateRepositoryOutputSchema
>;
