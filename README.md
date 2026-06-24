# github - Agent-mcp

**Tipo de documento:** Guía de Implementación  
**Fecha:** Junio 2026  
**Versión:** 1.0.0  
**Autor:** [wijimenezz](https://github.com/wijimenezz)  
**Estado:** Implementado  
**Presentación:** [Presentación Técnica](https://docs.google.com/presentation/d/1H6nAg_NHlrhAYGsYveeWNWZ5eUF52pRH/edit?usp=drive_link&ouid=108634393873448290134&rtpof=true&sd=true)

---

## Contexto y Objetivo

`wijimenezz github - agent` es un servidor MCP (Model Context Protocol) que expone herramientas para interactuar con GitHub usando lenguaje natural desde cualquier cliente MCP compatible (Claude Desktop, Antigravity IDE, VS Code Copilot, etc.).

En lugar de navegar la interfaz de GitHub o escribir scripts manualmente, puedes pedirle al agente en lenguaje natural cosas como: _"crea un repositorio llamado mi-proyecto"_ o _"lista todos mis issues abiertos en automatehub"_ y el servidor ejecuta la acción por ti.

**Estado actual:** el servidor expone 5 tools funcionales que cubren las operaciones más comunes de GitHub.

---

## Alcance

### Incluido

- Crear repositorios bajo la cuenta del usuario autenticado
- Listar repositorios del usuario autenticado
- Crear issues en un repositorio
- Listar issues de un repositorio con filtros
- Crear archivos y hacer commits en un repositorio

### Excluido

- Operaciones sobre Pull Requests
- Gestión de ramas (crear, eliminar, mergear)
- Manejo de organizaciones
- Webhooks o integraciones con CI/CD
- Autenticación OAuth (solo Personal Access Token)

### Suposiciones y Restricciones

- El usuario debe tener un GitHub Personal Access Token con permisos `repo`
- El servidor corre localmente vía `stdio` transport
- Compatible con cualquier cliente MCP que soporte stdio

---

# Casos de Uso

Este servidor MCP está diseñado para desarrolladores, ingenieros DevOps y agentes de IA que necesitan automatizar operaciones de GitHub mediante lenguaje natural.

## Casos de Uso Comunes

### Gestión de Repositorios

- Crear repositorios sin necesidad de abrir GitHub.
- Inicializar nuevos proyectos rápidamente.
- Generar estructuras de proyectos desde agentes de IA.

### Gestión de Issues

- Crear issues directamente desde conversaciones.
- Listar los issues de un repositorio.
- Realizar seguimiento de tareas de proyectos mediante clientes MCP.

### Gestión de Archivos y Commits

- Crear archivos de forma remota.
- Actualizar archivos existentes.
- Generar commits automáticamente desde flujos de trabajo con IA.

### Integraciones con Agentes de IA

- Claude Desktop
- Antigravity IDE
- VS Code Copilot
- Clientes MCP personalizados

## Beneficios

- Automatiza tareas repetitivas de GitHub.
- Expone funcionalidades de GitHub como herramientas MCP.
- Proporciona validación y manejo de errores.
- Simplifica la integración con asistentes de IA.

## Arquitectura

```mermaid
graph TD
    HOST[Cliente MCP\nAntigravity / Claude Desktop / VS Code] -->|stdio| SERVER[wijimenezz- agent\nMCP Server]
    SERVER --> TOOLS[Tools Layer\ncreate_issue / list_issues\ncreate_repository / list_repositories\ncreate_file]
    TOOLS --> CLIENT[GitHubClient]
    CLIENT --> REQUEST[githubRequest\nrate limit + retry]
    REQUEST --> OCTOKIT[Octokit REST]
    OCTOKIT -->|HTTPS| GITHUB[GitHub API]
```

### Componentes principales

| Componente           | Responsabilidad                                     | Tecnología                  |
| -------------------- | --------------------------------------------------- | --------------------------- |
| `McpServer`          | Levanta el servidor y registra tools                | `@modelcontextprotocol/sdk` |
| Tools (`/tools`)     | Validan input, llaman al cliente, arman el response | TypeScript + Zod            |
| `GitHubClient`       | Métodos tipados para cada operación GitHub          | Octokit + TypeScript        |
| `githubRequest`      | Wrapper genérico con rate limit y retry             | TypeScript                  |
| Schemas (`/schemas`) | Contratos de input/output con validación            | Zod v4                      |

---

## Estructura del proyecto

```
src/
├── github/
│   ├── githubClient.ts       # Métodos tipados para la API de GitHub
│   ├── octokit.ts            # Instancia de Octokit con el token
│   └── request.ts            # githubRequest: rate limit + retry
├── schemas/
│   ├── inputs/               # Schemas Zod de entrada por tool
│   ├── outputs/              # Schemas Zod de salida por tool
│   └── shared/               # Schemas reutilizables (owner, perPage)
├── tools/                    # Una función RegisterXxx por tool
│   ├── createIssue.ts
│   ├── listIssues.ts
│   ├── createRepository.ts
│   ├── listRepositories.ts
│   ├── createFile.ts
│   └── toolResult.ts         # toToolError: mapeo de errores
├── types/                    # Tipos auxiliares
├── error.ts                  # GitHubError + mapGitHubError
└── index.ts                  # Entry point: registra tools y conecta transport
```

---

## Tools disponibles

### `create_issue`

Crea un issue en un repositorio de GitHub.

| Campo   | Tipo   | Requerido | Descripción                            |
| ------- | ------ | --------- | -------------------------------------- |
| `owner` | string | ✅        | Usuario u organización dueña del repo  |
| `repo`  | string | ✅        | Nombre del repositorio                 |
| `title` | string | ✅        | Título del issue (mínimo 3 caracteres) |
| `body`  | string | ❌        | Cuerpo del issue en Markdown           |

---

### `list_issues`

Lista los issues de un repositorio con filtros y paginación.

| Campo     | Tipo   | Requerido | Default | Descripción                     |
| --------- | ------ | --------- | ------- | ------------------------------- |
| `owner`   | string | ✅        | —       | Usuario u organización          |
| `repo`    | string | ✅        | —       | Nombre del repositorio          |
| `state`   | enum   | ❌        | `all`   | `open`, `closed`, o `all`       |
| `perPage` | number | ❌        | `30`    | Resultados por página (máx 100) |
| `page`    | number | ❌        | `1`     | Número de página                |

---

### `create_repository`

Crea un repositorio en la cuenta del usuario autenticado.

| Campo         | Tipo    | Requerido | Default | Descripción                                  |
| ------------- | ------- | --------- | ------- | -------------------------------------------- |
| `name`        | string  | ✅        | —       | Nombre del repo (solo letras, números y `_`) |
| `description` | string  | ❌        | —       | Descripción del repositorio                  |
| `private`     | boolean | ❌        | `false` | `true` para repo privado                     |

---

### `list_repositories`

Lista los repositorios del usuario autenticado.

| Campo      | Tipo   | Requerido | Default   | Descripción                                 |
| ---------- | ------ | --------- | --------- | ------------------------------------------- |
| `type`     | enum   | ❌        | `all`     | `all`, `public`, o `private`                |
| `sort`     | enum   | ❌        | `updated` | `created`, `updated`, `pushed`, `full_name` |
| `per_page` | number | ❌        | `30`      | Resultados por página (máx 100)             |

---

### `create_file`

Crea un archivo en un repositorio y genera un commit.

Internamente ejecuta el flujo completo de la Git low-level API:
`getRef` → `getCommit` → `createBlob` → `createTree` → `createCommit` → `updateRef`

| Campo     | Tipo   | Requerido | Default | Descripción                                    |
| --------- | ------ | --------- | ------- | ---------------------------------------------- |
| `owner`   | string | ✅        | —       | Usuario u organización                         |
| `repo`    | string | ✅        | —       | Nombre del repositorio                         |
| `branch`  | string | ❌        | `main`  | Rama objetivo del commit                       |
| `path`    | string | ✅        | —       | Ruta relativa del archivo (ej: `src/index.ts`) |
| `content` | string | ✅        | —       | Contenido del archivo                          |
| `message` | string | ✅        | —       | Mensaje del commit                             |

---

## Instalación y configuración

### Prerrequisitos

- Node.js 18+
- Un GitHub Personal Access Token con permisos `repo`

# Configuración del Personal Access Token de GitHub

Este servidor MCP requiere un Personal Access Token (PAT) de GitHub para autenticarse y realizar operaciones sobre repositorios.

## Crear un Token

1. Inicia sesión en GitHub.
2. Abre **Settings (Configuración)**.
3. Navega a **Developer Settings (Configuración de Desarrollador)**.
4. Haz clic en **Personal Access Tokens**.
5. Selecciona una de las siguientes opciones:
   - **Fine-grained tokens** (recomendado).
   - O **Tokens (classic)**.
6. Haz clic en **Generate new token**.
7. Configura los permisos necesarios.
8. Genera el token.
9. Copia el token y guárdalo en un lugar seguro.

Ejemplo:

```env
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/wijimenezz/automatehub-mcp.git
cd automatehub-mcp

# 2. Instalar dependencias
npm install

# 3. Crear el archivo de variables de entorno
cp .env.example .env
# Editar .env y agregar tu token:
# GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx

# 4. Compilar
npm run build
```

### Variables de entorno

| Variable       | Requerida | Descripción                                         |
| -------------- | --------- | --------------------------------------------------- |
| `GITHUB_TOKEN` | ✅        | Personal Access Token de GitHub con permisos `repo` |

---

## Conectar a un cliente MCP

### Claude Desktop

Edita `%APPDATA%\Claude\claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "automatehub-mcp": {
      "command": "node",
      "args": ["C:/ruta/absoluta/al/proyecto/dist/index.js"],
      "env": {
        "GITHUB_TOKEN": "ghp_xxxxxxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

### Antigravity IDE / VS Code Copilot

Edita `~/.gemini/config/mcp_config.json` (Antigravity) o `settings.json` (VS Code):

```json
{
  "mcpServers": {
    "automatehub-mcp": {
      "type": "stdio",
      "command": "node",
      "args": ["C:/ruta/absoluta/al/proyecto/dist/index.js"],
      "env": {
        "GITHUB_TOKEN": "ghp_xxxxxxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

---

## Pruebas

### MCP Inspector (recomendado para desarrollo)

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

Abre `http://localhost:6274`, ve a la pestaña **Tools** y ejecuta cualquier tool con los parámetros que necesites.

### Tests unitarios

```bash
npm test
```

Los tests usan **Vitest** con mocks de `GitHubClient` para no hacer llamadas reales a la API.

| Archivo                         | Qué prueba                                               |
| ------------------------------- | -------------------------------------------------------- |
| `createIssue.tool.test.ts`      | Validación de input, creación exitosa, manejo de errores |
| `listIssues.tool.test.ts`       | Validación, listado exitoso, errores                     |
| `createRepository.tool.test.ts` | Validación, creación exitosa, errores                    |
| `createFile.tool.test.ts`       | Validación, commit exitoso, errores                      |

---

## Scripts disponibles

| Script     | Comando             | Descripción                                |
| ---------- | ------------------- | ------------------------------------------ |
| Desarrollo | `npm run dev`       | Corre el servidor con `tsx` (sin compilar) |
| Build      | `npm run build`     | Compila TypeScript a `dist/`               |
| Tests      | `npm test`          | Ejecuta los tests con Vitest               |
| Inspector  | `npm run inspector` | Levanta el MCP Inspector                   |

---

## Manejo de errores

Todos los errores de la API de GitHub se mapean a tipos específicos en `error.ts`:

| Tipo                    | Código HTTP | Descripción                                                      |
| ----------------------- | ----------- | ---------------------------------------------------------------- |
| `GitHubNotFoundError`   | 404         | Recurso no encontrado                                            |
| `GitHubValidationError` | 422         | Input inválido (campo faltante o incorrecto)                     |
| `GitHubRateLimitError`  | 429         | Rate limit alcanzado — el servidor reintenta automáticamente     |
| `GitHubServerError`     | 5xx         | Error del servidor de GitHub — reintenta con backoff exponencial |
| `unknown_error`         | —           | Error no mapeado                                                 |

---

## Stack tecnológico

| Tecnología                  | Versión | Uso                                   |
| --------------------------- | ------- | ------------------------------------- |
| TypeScript                  | 5.x     | Lenguaje principal                    |
| `@modelcontextprotocol/sdk` | 1.29    | Servidor MCP y transport stdio        |
| `@octokit/rest`             | latest  | Cliente de la API REST de GitHub      |
| Zod                         | v4      | Validación de schemas de input/output |
| Vitest                      | latest  | Tests unitarios                       |
| tsx                         | latest  | Ejecución en desarrollo sin compilar  |
