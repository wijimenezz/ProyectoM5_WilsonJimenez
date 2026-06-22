import { describe, it, expect, vi, beforeEach } from "vitest";
import { RegisterListRepositories } from "../tools/listRepositories.js";
import { GitHubClient } from "../github/githubClient.js";

// Factory mock que controla el constructor
const mockListRepositories = vi.fn();

vi.mock("../github/githubClient.js", () => ({
  GitHubClient: vi.fn().mockImplementation(() => ({
    listRepositories: mockListRepositories,
  })),
}));

describe("listRepositories Tool", () => {
  let mockServer: any;

  beforeEach(() => {
    mockServer = {
      registerTool: vi.fn(),
    };
    // Limpiar mocks entre tests
    vi.clearAllMocks();
  });

  it("debe retornar error de validación con input inválido", async () => {
    RegisterListRepositories(mockServer);
    const toolHandler = mockServer.registerTool.mock.calls[0][2];

    const result = await toolHandler({ type: "invalid" });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("VALIDATION");
  });

  it("debe listar repositorios exitosamente", async () => {
    const mockRepos = [
      {
        fullName: "user/repo1",
        url: "https://github.com/user/repo1",
        private: false,
        description: "Repo 1",
        owner: "user",
        defaultBranch: "main",
      },
    ];
    mockListRepositories.mockResolvedValue(mockRepos);

    RegisterListRepositories(mockServer);
    const toolHandler = mockServer.registerTool.mock.calls[0][2];

    const result = await toolHandler({
      type: "all",
      sort: "updated",
      per_page: 30,
    });

    expect(result.isError).toBeFalsy();
    expect(result.structuredContent.ok).toBe(true);
    expect(result.structuredContent.data).toEqual(mockRepos);
  });
});
