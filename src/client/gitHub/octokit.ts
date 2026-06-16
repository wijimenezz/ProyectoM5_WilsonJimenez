import { Octokit } from "@octokit/rest";
import { env } from "../gitHub/config/env.js";

export function createOctokit() {
  return new Octokit({
    auth: env.GITHUB_TOKEN,
    userAgent: "automatehub-mcp/1.0",
  });
}
