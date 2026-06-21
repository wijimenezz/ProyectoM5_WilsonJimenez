import { z } from "zod";
import { repositorySchema } from "../repository.js";
import { listRepositoriesSchema } from "../inputs/listRepository.js";

export const ListRepositoriesOutputSchema = z.object({
  ok: z.literal(true),
  data: z.array(repositorySchema),
});

export type ListRepositoryOutput = z.infer<typeof ListRepositoriesOutputSchema>;
