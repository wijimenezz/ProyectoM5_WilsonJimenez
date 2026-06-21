import { Octokit } from "@octokit/rest";
import { createOctokit } from "./octokit.js";
import { githubRequest } from "./request.js";
import { CreatedIssue } from "../schemas/createdIssue.js";
import { CreateRepository } from "../schemas/inputs/createRepository.js";
import { ListIssueInput } from "../schemas/inputs/listIssues.js";
import { CreateIssueInput } from "../schemas/inputs/createIssueInput.js";
import { Issue } from "../schemas/issue.js";
import { Repository } from "../schemas/repository.js";
import { ListRepository } from "../schemas/inputs/listRepository.js";
import { FileInput } from "../schemas/inputs/createFileIinput.js";

import { fileOutput } from "../schemas/file.js";

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

  async createFile(input: FileInput): Promise<fileOutput> {
    const { owner, repo, branch, path, content, message } = input;
    const refData = await githubRequest(() =>
      this.octokit.git.getRef({
        owner,
        repo,
        ref: `heads/${branch}`,
      }),
    );
    const commitSha = refData.object.sha;

    const commitData = await githubRequest(() =>
      this.octokit.git.getCommit({
        owner,
        repo,
        commit_sha: commitSha,
      }),
    );
    const treeSha = commitData.tree.sha;

    const blobData = await githubRequest(() =>
      this.octokit.git.createBlob({
        owner,
        repo,
        content: Buffer.from(content, "utf-8").toString("base64"),
        encoding: "base64",
      }),
    );
    0;

    const treeData = await githubRequest(() =>
      this.octokit.git.createTree({
        owner,
        repo,
        base_tree: treeSha,
        tree: [{ path, mode: "100644", type: "blob", sha: blobData.sha }],
      }),
    );

    const newCommit = await githubRequest(() =>
      this.octokit.git.createCommit({
        owner,
        repo,
        message,
        tree: treeData.sha,
        parents: [commitSha],
      }),
    );
    await githubRequest(() =>
      this.octokit.git.updateRef({
        owner,
        repo,
        ref: `heads/${branch}`,
        sha: newCommit.sha,
      }),
    );
    return {
      sha: newCommit.sha,
      url: `https://github.com/${owner}/${repo}/blob/${branch}/${path}`,
      path,
      branch,
    };
  }
}
