import z from "zod";
import { fileSchema } from "../file.js";

export const fileOutputSchema = z.object({
  ok: z.literal(true),
  data: fileSchema,
});
