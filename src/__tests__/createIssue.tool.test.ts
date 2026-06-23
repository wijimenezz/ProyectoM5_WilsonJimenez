import { describe, it, expect, vi, beforeEach } from "vitest";
import { ResgisterCreateIssue } from "../tools/createIssue.js";

const mockCreateIssue = vi.fn();

vi.mock("../github/githubClient.js", () => ({
  GitHubClient: vi.fn().mockImplementation(() => ({
    createIssue: mockCreateIssue,
  })),
}));

describe("createIssue Tool", () => {
  let mockServer: any;

  beforeEach(() => {
    mockServer = { registerTool: vi.fn() };
    vi.clearAllMocks();
  });

  it("debe retornar error de validación con input inválido", async () => {
    ResgisterCreateIssue(mockServer);
    const toolHandler = mockServer.registerTool.mock.calls[0][2];

    const result = await toolHandler({ owner: "user" });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("VALIDATION");
  });

  it("debe crear issue exitosamente", async () => {
    const mockIssueData = {
      number: 1,
      url: "https://github.com/user/repo/issues/1",
      title: "Test Issue",
    };
    mockCreateIssue.mockResolvedValue(mockIssueData);

    ResgisterCreateIssue(mockServer);
    const toolHandler = mockServer.registerTool.mock.calls[0][2];

    const result = await toolHandler({
      owner: "user",
      repo: "repo",
      title: "Test Issue",
      body: "Test body",
    });

    expect(result.isError).toBeFalsy();
    expect(result.structuredContent.ok).toBe(true);
    expect(result.structuredContent.data).toEqual(mockIssueData);
  });

  it("debe manejar errores de GitHubClient", async () => {
    // Lanzar el error exacto que la tool puede recibir
    mockCreateIssue.mockRejectedValue(new Error("GitHub API error"));

    ResgisterCreateIssue(mockServer);
    const toolHandler = mockServer.registerTool.mock.calls[0][2];

    const result = await toolHandler({
      owner: "user",
      repo: "repo",
      title: "Test Issue",
      body: "Test body",
    });

    expect(result.isError).toBe(true);
    // Ajustar según el tipo de error real que retorna la tool
    expect(result.content[0].text).toContain("unknown_error");
  });
});
