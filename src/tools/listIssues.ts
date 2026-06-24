import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { listIssuesInputSchema } from "../schemas/inputs/listIssues.js";
import { listIssueOutputSchema } from "../schemas/outputs/listIssues.Output.js";
import { GitHubClient } from "../github/githubClient.js";
import { toToolError } from "../helpers/toolResult.js";

export function RegisterListIssues(server: McpServer) {
  server.registerTool(
    "list_issues",
    {
      description: "Lista los issues de un repositorio en GitHub",
      inputSchema: listIssuesInputSchema,
      outputSchema: listIssueOutputSchema,
    },
    async (args) => {
      const parsed = listIssuesInputSchema.safeParse(args);

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
        const issues = await gh.listIssues(parsed.data);
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
