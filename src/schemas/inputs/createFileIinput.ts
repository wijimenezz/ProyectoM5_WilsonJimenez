import { z } from "zod";
import { repositoryOwnerSchema } from "../shared/owner.js";

export const createfileInputSchema = z.object({
  owner: repositoryOwnerSchema,
  repo: z
    .string()
    .min(1)
    .describe("nombre del Repositorio sin el prefijo del owner"),
  branch: z
    .string()
    .min(1)
    .default("main")
    .describe("Rama objetivo del commit, por default es main"),
  path: z.string().min(1).describe("ruta reltiva del repositorio src/index.js"),
  content: z.string().describe("Contenido del commit"),
  message: z.string().min(1).describe("Mensaje que acompaña el commit"),
});

export type FileInput = z.infer<typeof createfileInputSchema>;
