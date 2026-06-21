import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { createRepositorySchema } from "../schemas/inputs/createRepository.js";
import { CreateRepositoryOutputSchema } from "../schemas/outputs/createRepository.Output.js";
import { GitHubClient } from "../github/githubClient.js";
import { toToolError } from "./toolResult.js";

export function RegisterCreateRepository(server: McpServer) {
  server.registerTool(
    "create_repository",
    {
      description: "Crea un repositorio en GitHub",
      inputSchema: createRepositorySchema,
      outputSchema: CreateRepositoryOutputSchema,
    },
    async (args) => {
      const parsed = createRepositorySchema.safeParse(args);

      if (!parsed.success) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                ok: false,
                error: {
                  type: "VALIDATION",
                  message: parsed.error.message,
                },
              }),
            },
          ],
          isError: true,
        };
      }

      const gh = new GitHubClient();

      try {
        const data = await gh.createRepository(parsed.data);

        const result = {
          ok: true,
          data,
        };

        return {
          structuredContent: result,
          content: [
            {
              type: "text",
              text: JSON.stringify(result),
            },
          ],
        };
      } catch (err) {
        const toolError = toToolError(err);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(toolError),
            },
          ],
          isError: true,
        };
      }
    },
  );
}
