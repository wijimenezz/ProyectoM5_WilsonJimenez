import { describe, it, expect, vi, beforeEach } from "vitest";
import { RegisterListIssues } from "../tools/listIssues.js";

const mockListIssues = vi.fn();

vi.mock("../github/githubClient.js", () => ({
  GitHubClient: vi.fn().mockImplementation(() => ({
    listIssues: mockListIssues,
  })),
}));

describe("listIssues Tool", () => {
  let mockServer: any;

  beforeEach(() => {
    mockServer = { registerTool: vi.fn() };
    vi.clearAllMocks();
  });

  it("debe registrar el tool correctamente", () => {
    RegisterListIssues(mockServer);

    expect(mockServer.registerTool).toHaveBeenCalledWith(
      "list_issues",
      expect.objectContaining({
        description: "Lista los issues de un repositorio en GitHub",
      }),
      expect.any(Function),
    );
  });

  it("debe retornar error de validación con input inválido", async () => {
    RegisterListIssues(mockServer);
    const toolHandler = mockServer.registerTool.mock.calls[0][2];

    // falta owner y repo que son requeridos
    const result = await toolHandler({});

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("VALIDATION");
  });

  it("debe listar issues exitosamente", async () => {
    const mockIssuesData = [
      {
        number: 1,
        title: "Bug en login",
        state: "open",
        url: "https://github.com/user/repo/issues/1",
        createdAt: "2024-01-15T10:30:00Z",
      },
      {
        number: 2,
        title: "Feature request",
        state: "closed",
        url: "https://github.com/user/repo/issues/2",
        createdAt: "2024-01-16T10:30:00Z",
      },
    ];
    mockListIssues.mockResolvedValue(mockIssuesData);

    RegisterListIssues(mockServer);
    const toolHandler = mockServer.registerTool.mock.calls[0][2];

    const result = await toolHandler({
      owner: "user",
      repo: "repo",
      state: "all",
      perPage: 30,
      page: 1,
    });

    expect(result.isError).toBeFalsy();
    expect(result.structuredContent.ok).toBe(true);
    expect(result.structuredContent.data).toEqual(mockIssuesData);
  });

  it("debe manejar errores de GitHubClient", async () => {
    mockListIssues.mockRejectedValue(new Error("GitHub API error"));

    RegisterListIssues(mockServer);
    const toolHandler = mockServer.registerTool.mock.calls[0][2];

    const result = await toolHandler({
      owner: "user",
      repo: "repo",
      state: "all",
      perPage: 30,
      page: 1,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("unknown_error");
  });
});
