import { describe, it, expect, vi, beforeEach } from "vitest";
import { RegisterCreateRepository } from "../tools/createRepository.js";

const mockCreateRepository = vi.fn();

vi.mock("../../github/githubClient", () => ({
  GitHubClient: vi.fn().mockImplementation(() => ({
    createRepository: mockCreateRepository,
  })),
}));

describe("createRepository Tool", () => {
  let mockServer: any;

  beforeEach(() => {
    mockServer = { registerTool: vi.fn() };
    vi.clearAllMocks();
  });

  it("debe registrar el tool correctamente", () => {
    RegisterCreateRepository(mockServer);

    expect(mockServer.registerTool).toHaveBeenCalledWith(
      "create_repository",
      expect.objectContaining({
        description: "Crea un repositorio en GitHub",
      }),
      expect.any(Function),
    );
  });

  it("debe retornar error de validación con input inválido", async () => {
    RegisterCreateRepository(mockServer);
    const toolHandler = mockServer.registerTool.mock.calls[0][2];

    const result = await toolHandler({ name: 123 });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("VALIDATION");
  });

  it("debe crear repositorio exitosamente", async () => {
    const mockRepoData = {
      owner: "user",
      fullName: "user/repo",
      description: "Test repo",
      url: "https://github.com/user/repo",
      private: false,
      defaultBranch: "main",
    };
    mockCreateRepository.mockResolvedValue(mockRepoData);

    RegisterCreateRepository(mockServer);
    const toolHandler = mockServer.registerTool.mock.calls[0][2];

    const result = await toolHandler({
      name: "repo",
      description: "Test repo",
      private: false,
    });

    expect(result.isError).toBeFalsy();
    expect(result.structuredContent.ok).toBe(true);
    expect(result.structuredContent.data).toEqual(mockRepoData);
  });

  it("debe manejar errores de GitHubClient", async () => {
    mockCreateRepository.mockRejectedValue(new Error("GitHub API error"));

    RegisterCreateRepository(mockServer);
    const toolHandler = mockServer.registerTool.mock.calls[0][2];

    const result = await toolHandler({
      name: "repo",
      description: "Test repo",
      private: false,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("unknown_error");
  });
});
