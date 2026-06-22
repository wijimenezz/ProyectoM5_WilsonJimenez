import { describe, it, expect, vi, beforeEach } from "vitest";
import { GitHubClient } from "../github/githubClient.js";

vi.mock("../../github/request", () => ({
  githubRequest: vi.fn(async (fn) => {
    const result = await fn();
    return result.data;
  }),
}));

vi.mock("../../github/octokit");

describe("GitHubClient", () => {
  let mockOctokit: any;
  let client: GitHubClient;

  beforeEach(() => {
    mockOctokit = {
      issues: {
        create: vi.fn(),
        listForRepo: vi.fn(),
      },
      repos: {
        createForAuthenticatedUser: vi.fn(),
        listForAuthenticatedUser: vi.fn(),
      },
      git: {
        getRef: vi.fn(),
        getCommit: vi.fn(),
        createBlob: vi.fn(),
        createTree: vi.fn(),
        createCommit: vi.fn(),
        updateRef: vi.fn(),
      },
    };
    client = new GitHubClient(mockOctokit);
  });

  describe("createIssue", () => {
    it("debe crear un issue correctamente", async () => {
      const mockResponse = {
        data: {
          number: 1,
          html_url: "https://github.com/user/repo/issues/1",
          title: "Test Issue",
        },
        headers: {},
      };
      mockOctokit.issues.create.mockResolvedValue(mockResponse);

      const result = await client.createIssue({
        owner: "user",
        repo: "repo",
        title: "Test Issue",
        body: "Test body",
      });

      expect(result).toEqual({
        number: 1,
        url: "https://github.com/user/repo/issues/1",
        title: "Test Issue",
      });
    });
  });

  describe("listIssues", () => {
    it("debe listar issues correctamente", async () => {
      const mockResponse = {
        data: [
          {
            number: 1,
            title: "Issue 1",
            state: "open",
            html_url: "https://github.com/user/repo/issues/1",
            created_at: "2024-01-01",
          },
        ],
        headers: {},
      };
      mockOctokit.issues.listForRepo.mockResolvedValue(mockResponse);

      const result = await client.listIssues({
        owner: "user",
        repo: "repo",
        state: "open",
        perPage: 10,
        page: 1,
      });

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Issue 1");
    });
  });

  describe("createRepository", () => {
    it("debe crear un repositorio correctamente", async () => {
      const mockResponse = {
        data: {
          owner: { login: "user" },
          full_name: "user/new-repo",
          description: "Test repo",
          html_url: "https://github.com/user/new-repo",
          private: false,
          default_branch: "main",
        },
        headers: {},
      };
      mockOctokit.repos.createForAuthenticatedUser.mockResolvedValue(
        mockResponse,
      );

      const result = await client.createRepository({
        name: "new-repo",
        description: "Test repo",
        private: false,
      });

      expect(result.owner).toBe("user");
      expect(result.fullName).toBe("user/new-repo");
    });
  });

  describe("listRepositories", () => {
    it("debe listar repositorios correctamente", async () => {
      const mockResponse = {
        data: [
          {
            full_name: "user/repo1",
            html_url: "https://github.com/user/repo1",
            private: false,
            description: "Repo 1",
            owner: { login: "user" },
            default_branch: "main",
          },
        ],
        headers: {},
      };
      mockOctokit.repos.listForAuthenticatedUser.mockResolvedValue(
        mockResponse,
      );

      const result = await client.listRepositories({
        type: "all",
        sort: "updated",
        per_page: 30,
      });

      expect(result).toHaveLength(1);
      expect(result[0].fullName).toBe("user/repo1");
    });
  });

  describe("createFile", () => {
    it("debe crear un archivo correctamente", async () => {
      mockOctokit.git.getRef.mockResolvedValue({
        data: { object: { sha: "abc123" } },
        headers: {},
      });
      mockOctokit.git.getCommit.mockResolvedValue({
        data: { tree: { sha: "tree123" } },
        headers: {},
      });
      mockOctokit.git.createBlob.mockResolvedValue({
        data: { sha: "blob123" },
        headers: {},
      });
      mockOctokit.git.createTree.mockResolvedValue({
        data: { sha: "newtree123" },
        headers: {},
      });
      mockOctokit.git.createCommit.mockResolvedValue({
        data: { sha: "commit123" },
        headers: {},
      });
      mockOctokit.git.updateRef.mockResolvedValue({
        data: {},
        headers: {},
      });

      const result = await client.createFile({
        owner: "user",
        repo: "repo",
        branch: "main",
        path: "test.txt",
        content: "Hello World",
        message: "Add test file",
      });

      expect(result.sha).toBe("commit123");
      expect(result.path).toBe("test.txt");
    });
  });
});
