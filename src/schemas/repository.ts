import { z } from "zod";

export const repositorySchema = z.object({
  fullName: z.string(),
  url: z.url(),
  private: z.boolean(),
  owner: z.string(),
});
