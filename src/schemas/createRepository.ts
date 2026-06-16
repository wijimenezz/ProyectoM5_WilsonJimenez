import { z } from "zod";

export const createRepositorySchema = z.object({
  name: z
    .string()
    .min(3)
    .regex(/^[a-zA-Z0-9_]+$/)
    .describe(
      "El nombre del Repositorio debe tener al menos 3 caracteres y solo puede contener caracteres especiales",
    ),
  private: z
    .boolean()
    .default(false)
    .optional()
    .describe("El repositorio creado sera publico por defecto"),
  description: z
    .string()
    .min(3, "la decripcion debe ser mayor a 3 caracteres")
    .describe("descripcion del repositorio")
    .optional(),
});
