import { Octokit } from "@octokit/rest";
import { createOctokit } from "./octokit.js";
import { githubRequest } from "./request.js";
import { CreatedIssue } from "../schemas/createdIssue.js";
import { CreateRepository } from "../schemas/inputs/createRepository.js";
import { ListIssueInput } from "../schemas/inputs/listIssues.js";
import { CreateIssueInput } from "../schemas/inputs/createIssueInput.js";
import { ListissuesOutput } from "../schemas/outputs/listIssues.Output.js";
import { Issue } from "../schemas/issue.js";
import { Repository } from "../schemas/repository.js";
import { ListRepository } from "../schemas/inputs/listRepository.js";

export class GitHubClient {
  private octokit: Octokit;
  constructor(octokit: Octokit = createOctokit()) {
    this.octokit = octokit;
  }
  async createIssue(input: CreateIssueInput): Promise<CreatedIssue> {
    const { owner, repo, title, body } = input;
    const data = await githubRequest(() =>
      this.octokit.issues.create({ owner, repo, title, body }),
    );
    return {
      number: data.number,
      url: data.html_url,
      title: data.title,
    };
  }

  async listIssues(input: ListIssueInput): Promise<Issue[]> {
    const { owner, repo, state, perPage, page } = input;
    const data = await githubRequest(() =>
      this.octokit.issues.listForRepo({
        owner,
        repo,
        state,
        per_page: perPage,
        page,
      }),
    );

    return data.map((issue) => ({
      number: issue.number,
      title: issue.title,
      state: issue.state as "open" | "closed",
      url: issue.html_url,
      createdAt: issue.created_at,
    }));
  }

  async createRepository(input: CreateRepository): Promise<Repository> {
    const { name, description, private: isPrivate } = input;
    const data = await githubRequest(() =>
      this.octokit.repos.createForAuthenticatedUser({
        name,
        description,
        private: isPrivate,
        auto_init: true,
      }),
    );

    return {
      owner: data.owner.login,
      fullName: data.full_name,
      description: data.description,
      url: data.html_url,
      private: data.private,
      defaultBranch: data.default_branch,
    };
  }

  async listRepositories(input: ListRepository): Promise<Repository[]> {
    const { type, sort, per_page } = input;
    const data = await githubRequest(() =>
      this.octokit.repos.listForAuthenticatedUser({
        type,
        sort,
        per_page,
      }),
    );

    return data.map((repo) => ({
      fullName: repo.full_name,
      url: repo.html_url,
      private: repo.private,
      description: repo.description ?? null,
      owner: repo.owner.login,
      defaultBranch: repo.default_branch,
    }));
  }
}
