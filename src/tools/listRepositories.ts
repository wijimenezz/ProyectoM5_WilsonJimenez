import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";

import { GitHubClient } from "../github/githubClient.js";
import { toToolError } from "../helpers/toolResult.js";
import { listRepositoriesSchema } from "../schemas/inputs/listRepository.js";
import { ListRepositoriesOutputSchema } from "../schemas/outputs/listRepository.Output.js";

export function RegisterListRepositories(server: McpServer) {
  server.registerTool(
    "list_repositories",
    {
      description: "Lista los repositorios de un usuario en GitHub",
      inputSchema: listRepositoriesSchema,
      outputSchema: ListRepositoriesOutputSchema,
    },
    async (args) => {
      const parsed = listRepositoriesSchema.safeParse(args);

      if (!parsed.success) {
        const messages = parsed.error.issues.map((e) => e.message).join("; ");

        const body = {
          ok: false,
          error: {
            type: "VALIDATION",
            message: messages,
          },
        };

        return {
          content: [{ type: "text", text: JSON.stringify(body) }],
          isError: true,
        };
      }

      const gh = new GitHubClient();

      try {
        const issues = await gh.listRepositories(parsed.data);
        const result = { ok: true, data: issues };

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
}
