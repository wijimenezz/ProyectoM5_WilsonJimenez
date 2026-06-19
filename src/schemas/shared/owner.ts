import { z } from "zod";

export const repositoryOwnerSchema = z.object({
  owner: z
    .string()
    .min(1, "el nombre del autor debe tener minimo 1 caracteres")
    .max(50, "el nombre del autor debe temr maximo 50 caracteres")
    .describe("Dueño del Repositorio (organizacion o empresa)"),
});
