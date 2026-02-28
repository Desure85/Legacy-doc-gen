# DocuGen MCP Server

A Model Context Protocol (MCP) server designed to help AI agents understand, document, and refactor legacy PHP monoliths (specifically Yii2/Laravel) and modern frontend stacks.

## Features

*   **Stack-Agnostic Discovery**: Automatically identifies tech stacks (PHP, React, Vue, etc.), folder structures, and architectural patterns.
*   **Semantic Indexing**: Indexes your codebase into a vector database (Qdrant) for semantic search and RAG (Retrieval-Augmented Generation).
*   **API Contract Generation**: Analyzes the boundary between legacy backends and modern frontends to generate OpenAPI specs.
*   **Dead Code Hunter**: Finds unused code, obsolete scripts, and disconnected components.
*   **Refactoring Assistant**: Guides the modernization of legacy components.
*   **Real-time Dashboard**: Monitor indexing status, view logs, and manage MCP prompts via a web UI.

## Prerequisites

*   Node.js v18+
*   Git
*   A legacy PHP codebase (optional for testing, required for real usage)
*   Qdrant instance (optional, defaults to in-memory simulation for demo)

## Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd docugen-mcp
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure environment variables:
    Copy `.env.example` to `.env` (if not exists) and set your keys.
    ```env
    PORT=3000
    # GEMINI_API_KEY=... (Required for semantic analysis)
    # QDRANT_URL=... (Required for vector storage)
    ```

## How It Works (The "Cascade" Experience)

Think of this MCP server as a **plugin that gives your IDE Agent superpowers**.

Just like **Cascade in Windsurf** or **Copilot in VS Code** can read your open files, this MCP server allows them to:
1.  **"See" the whole project structure** (not just open files).
2.  **Understand the relationships** between your legacy PHP backend and modern React frontend.
3.  **Search semantically** ("Where is the billing logic?") instead of just regex grep.

### Supported Agents

This server implements the **Model Context Protocol (MCP)**, so it works with any MCP-compliant IDE or tool:

*   **Windsurf (via Cascade)**: Connects locally to provide deep context.
*   **Cursor**: Use via the MCP settings to enhance the "Chat" experience.
*   **VS Code (with Cline/Roo Code)**: The most popular way to use MCP today.
*   **Claude Desktop**: For working outside the IDE.

## Usage

### 1. Start the Server

Run the development server:

```bash
npm run dev
```

The web dashboard will be available at `http://localhost:3000`.

### 2. Connect Your IDE

#### VS Code (with Cline Extension)
1.  Install the **Cline** extension.
2.  Open Cline settings -> **MCP Servers**.
3.  Add a new server:
    *   **Name**: `docugen`
    *   **Type**: `SSE` (Server-Sent Events)
    *   **URL**: `http://localhost:3000/sse`

#### Windsurf / Cursor
Check your IDE's settings for "MCP Servers" or "Context Providers". Point it to the running server URL: `http://localhost:3000/sse`.

### 3. Workflow

1.  **Configure Project**: Go to the **Settings** page in the dashboard (`http://localhost:3000/settings`) and set the `Project Root` to your target legacy repository path.
2.  **Chat with your Code**: Open your IDE Chat (Cascade/Cline) and ask:
    > "Analyze the architecture of this project using the `analyze_architecture` tool."
    > "Find dead code in the `User` module."
    > "Explain how the frontend `Checkout` component talks to the backend."

The Agent will transparently call the tools provided by this server and give you a context-aware answer.

## Docker Support

You can run the DocuGen MCP server using Docker.

### 1. Build and Run

```bash
docker-compose up --build
```

The dashboard will be available at `http://localhost:3000`.

### 2. Connect MCP Client (Claude Desktop)

To connect Claude Desktop to the Dockerized MCP server, you need to configure it to use `docker exec` or run the container directly.

**Option A: Run via Docker (Recommended)**

Update your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "docugen-docker": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-v", "/path/to/your/codebase:/codebase", // Mount your target codebase
        "docugen-mcp"
      ]
    }
  }
}
```

*Note: Ensure you have built the image first using `docker build -t docugen-mcp .`*

**Option B: Connect to Running Container**

If the container is already running (e.g., via `docker-compose`), you can use `docker exec`:

```json
{
  "mcpServers": {
    "docugen-exec": {
      "command": "docker",
      "args": ["exec", "-i", "docugen-mcp_docugen-mcp_1", "node", "dist/server.js"]
    }
  }
}
```

## Architecture

*   **MCP Server (Local)**: Runs on your machine (port 3000). It analyzes code and provides "Tools" to the IDE.
*   **IDE Agent (Client)**: Your interface (Windsurf/Cline/Cursor). It sends your questions to the LLM, which decides to call our MCP tools.
*   **Dashboard**: A visual UI to see what the server is indexing and to manage settings.

## Troubleshooting

*   **Logs**: Check the **System Logs** page in the dashboard for real-time server events and errors.
*   **Simulation Mode**: If the backend cannot connect to real services (Git/Qdrant), it falls back to simulation mode for demonstration purposes.
