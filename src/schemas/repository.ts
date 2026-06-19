import { z } from "zod";

export const repositorySchema = z.object({
  fullName: z.string(),
  url: z.url(),
  private: z.boolean(),
  description: z.string().nullable().optional(),
  owner: z.string(),
  defaultBranch: z.string(),
});

export type Repository = z.infer<typeof repositorySchema>;
