import { z } from "zod";

export const listRepositoriesSchema = z.object({
  type: z
    .enum(["all", "public", "private"])
    .default("all")
    .describe("Tipo de repos a listar (default: all)"),

  sort: z
    .enum(["created", "updated", "pushed", "full_name"])
    .default("updated")
    .describe("Criterio de ordenamiento (default: updated)"),

  per_page: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(30)
    .describe("Cantidad de resultados por página, máx 100 (default: 30)"),
});

export type ListRepository = z.infer<typeof listRepositoriesSchema>;
