import { Octokit } from "@octokit/rest";
import { createOctokit } from "./octokit.js";
import { githubRequest } from "./request.js";
import { Issue } from "../schemas/issue.js";
import { CreatedIssue } from "../schemas/createdIssue.js";

export class GitHubClient {
  private octokit: Octokit;
  constructor(octokit: Octokit = createOctokit()) {
    this.octokit = octokit;
  }
  async createIssue(
    owner: string,
    repo: string,
    title: string,
    body?: string,
  ): Promise<CreatedIssue> {
    const data = await githubRequest(() =>
      this.octokit.issues.create({ owner, repo, title, body }),
    );
    return {
      number: data.number,
      url: data.html_url,
      title: data.title,
    };
  }
}
