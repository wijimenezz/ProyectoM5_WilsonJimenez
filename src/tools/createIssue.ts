import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { createIssueSchema } from "../schemas/inputs/createIssueInput.js";
import { CreateIssueOutputSchema } from "../schemas/outputs/createIssue.Output.js";
import { GitHubClient } from "../github/githubClient.js";
import { toToolError } from "./toolResult.js";

export function ResgisterCreateIssue(server: McpServer) {
  server.registerTool(
    "Create Issue",
    {
      description: "Crea un repositorio en github",
      inputSchema: createIssueSchema,
      outputSchema: CreateIssueOutputSchema,
    },
    async (args) => {
      const parsed = createIssueSchema.safeParse(args);

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
          content: [
            {
              type: "text",
              text: JSON.stringify(body),
            },
          ],
          isError: true,
        };
      }

      const { owner, repo, title, body } = parsed.data;
      const gh = new GitHubClient();

      try {
        const data = await gh.createIssue({ owner, repo, title, body });
        const result = { ok: true, data };

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
