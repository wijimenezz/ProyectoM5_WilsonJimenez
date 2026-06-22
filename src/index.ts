import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ResgisterCreateIssue } from "./tools/createIssue.js";
import { RegisterListIssues } from "./tools/listIssues.js";
import { RegisterCreateRepository } from "./tools/createRepository.js";
import { RegisterListRepositories } from "./tools/listRepositories.js";
import { RegisterCreateFile } from "./tools/createfile.js";

export const server = new McpServer({
  name: "wijimenezz-agent",
  version: "1.0.0",
});
ResgisterCreateIssue(server);
RegisterListIssues(server);
RegisterCreateRepository(server);
RegisterListRepositories(server);
RegisterCreateFile(server);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP server is UP!");
}

main();
