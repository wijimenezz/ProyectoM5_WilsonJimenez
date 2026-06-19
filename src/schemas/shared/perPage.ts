import z from "zod";

export const perPageNumberSchema = z.object({
  perPage: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(30)
    .describe("Cantidad de resultados por página, máx 100 (default: 30)"),
});
