import { z } from "zod";
import { repositorySchema } from "../repository.js";

export const CreateRepositoryOutputSchema = z.object({
  ok: z.literal(true),
  data: repositorySchema,
});

export type CreateRepositoryOutput = z.infer<
  typeof CreateRepositoryOutputSchema
>;
