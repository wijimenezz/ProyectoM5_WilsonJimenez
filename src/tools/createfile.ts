import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { createfileInputSchema } from "../schemas/inputs/createfile.js";
import { fileOutputSchema } from "../schemas/outputs/file.Output.js";
import { GitHubClient } from "../github/githubClient.js";
import { toToolError } from "./toolResult.js";

export function RegisterCreateFile(server: McpServer) {
  server.registerTool(
    "create_file",
    {
      description: "Crea un archivo en un repositorio de GitHub",
      inputSchema: createfileInputSchema,
      outputSchema: fileOutputSchema,
    },
    async (args) => {
      const parsed = createfileInputSchema.safeParse(args);

      if (!parsed.success) {
        const messages = parsed.error.issues.map((e) => e.message).join("; ");

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                ok: false,
                error: { type: "VALIDATION", message: messages },
              }),
            },
          ],
          isError: true,
        };
      }

      const gh = new GitHubClient();

      try {
        const file = await gh.createFile(parsed.data);
        const result = { ok: true, data: file };

        return {
          structuredContent: result,
          content: [{ type: "text", text: JSON.stringify(result) }],
        };
      } catch (err) {
        const toolError = toToolError(err);
        return {
          content: [{ type: "text", text: JSON.stringify(toolError) }],
          isError: true,
        };
      }
    },
  );

  console.error("[RegisterCreateFile] tool registrada ✅");
}
