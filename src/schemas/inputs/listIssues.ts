import z from "zod";
import { repositoryOwnerSchema } from "../shared/owner.js";
import { perPageNumberSchema } from "../shared/perPage.js";

export const listIssuesInputSchema = z.object({
  owner: repositoryOwnerSchema,
  repo: z.string().describe("nombre del Repositorio"),
  state: z
    .enum(["open", "closed", "all"])
    .default("all")
    .describe("Estado del issue"),
  perPage: perPageNumberSchema,
  page: z.number().int().min(1),
});

export type ListIssueInput = z.infer<typeof listIssuesInputSchema>;
