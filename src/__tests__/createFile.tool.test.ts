import { describe, it, expect, vi, beforeEach } from "vitest";
import { RegisterCreateFile } from "../tools/createfile.js";

const mockCreateFile = vi.fn();

vi.mock("../github/githubClient.js", () => ({
  GitHubClient: vi.fn().mockImplementation(() => ({
    createFile: mockCreateFile,
  })),
}));

describe("createFile Tool", () => {
  let mockServer: any;

  beforeEach(() => {
    mockServer = { registerTool: vi.fn() };
    vi.clearAllMocks();
  });

  it("debe registrar el tool correctamente", () => {
    RegisterCreateFile(mockServer);

    expect(mockServer.registerTool).toHaveBeenCalledWith(
      "create_file",
      expect.objectContaining({
        description: "Crea un archivo en un repositorio de GitHub",
      }),
      expect.any(Function),
    );
  });

  it("debe retornar error de validación con input inválido", async () => {
    RegisterCreateFile(mockServer);
    const toolHandler = mockServer.registerTool.mock.calls[0][2];

    // faltan owner, repo, path, content, message
    const result = await toolHandler({});

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("VALIDATION");
  });

  it("debe crear archivo exitosamente", async () => {
    const mockFileData = {
      sha: "abc123def456",
      url: "https://github.com/user/repo/blob/main/src/index.ts",
      path: "src/index.ts",
      branch: "main",
    };
    mockCreateFile.mockResolvedValue(mockFileData);

    RegisterCreateFile(mockServer);
    const toolHandler = mockServer.registerTool.mock.calls[0][2];

    const result = await toolHandler({
      owner: "user",
      repo: "repo",
      branch: "main",
      path: "src/index.ts",
      content: "console.log('hola')",
      message: "feat: add index file",
    });

    expect(result.isError).toBeFalsy();
    expect(result.structuredContent.ok).toBe(true);
    expect(result.structuredContent.data).toEqual(mockFileData);
  });

  it("debe manejar errores de GitHubClient", async () => {
    mockCreateFile.mockRejectedValue(new Error("GitHub API error"));

    RegisterCreateFile(mockServer);
    const toolHandler = mockServer.registerTool.mock.calls[0][2];

    const result = await toolHandler({
      owner: "user",
      repo: "repo",
      branch: "main",
      path: "src/index.ts",
      content: "console.log('hola')",
      message: "feat: add index file",
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("unknown_error");
  });
});
