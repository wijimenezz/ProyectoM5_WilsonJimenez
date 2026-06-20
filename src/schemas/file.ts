import { z } from "zod";

export const fileSchema = z.object({
  sha: z.string(),
  url: z.url(),
  path: z.string(),
  branch: z.string(),
});

export type fileOutput = z.infer<typeof fileSchema>;
