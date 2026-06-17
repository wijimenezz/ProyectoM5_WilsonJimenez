import { z } from "zod";
import { repositorySchema } from "./repository.js";

export const ListRepositoriesOutputSchema = z.object({
  ok: z.literal(true),
  data: z.array(repositorySchema),
});
