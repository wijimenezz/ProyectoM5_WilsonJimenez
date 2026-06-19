import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio";
import { ResgisterCreateIssue } from "./tools/createIssue.js";
import { RegisterListIssues } from "./tools/listIssues.js";

export const server = new McpServer({
  name: "wijimenezz",
  version: "1.0.0",
});
ResgisterCreateIssue(server);
RegisterListIssues(server);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP server is UP!");
}

main();
