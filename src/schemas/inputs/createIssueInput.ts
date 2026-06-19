import { z } from "zod";
import { repositoryOwnerSchema } from "../shared/owner.js";

export const createIssueSchema = z.object({
  owner: repositoryOwnerSchema,
  repo: z.string().min(1).describe("Nombre del Repositorio"),
  title: z
    .string()
    .min(3, { message: "El título debe tener al menos 3 caracteres." })
    .describe("Título del issue (mínimo 3 caracteres)"),

  body: z
    .string()
    .optional()
    .describe("Cuerpo del issue en Markdown (opcional)"),
});

export type CreateIssueInput = z.infer<typeof createIssueSchema>;
