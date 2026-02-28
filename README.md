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

## Usage

### 1. Start the Server

Run the development server:

```bash
npm run dev
```

The web dashboard will be available at `http://localhost:3000`.

### 2. Connect your MCP Client

Configure your IDE (e.g., Cursor, VS Code with Cline) or Claude Desktop to connect to this MCP server.

**Claude Desktop Config (`claude_desktop_config.json`):**

```json
{
  "mcpServers": {
    "docugen": {
      "command": "node",
      "args": ["path/to/docugen-mcp/dist/server.js"]
    }
  }
}
```

*Note: You will need to build the project first using `npm run build` to generate the `dist` folder.*

### 3. Workflow

1.  **Configure Project**: Go to the **Settings** page in the dashboard and set the `Project Root` to your target legacy repository path.
2.  **Start Discovery**: Go to **Project Discovery** and click "Start Auto-Discovery". The system will:
    *   Parse the AST (Abstract Syntax Tree).
    *   Identify the architecture.
    *   Use the AI Agent to semantically map business domains.
3.  **Sync Index**: Use the **Dashboard** to sync the vector index with the current Git branch.
4.  **Use Prompts**: Go to **MCP Prompts** to view or edit the system prompts used by the agent (e.g., "Dead Code Hunter").
5.  **Interact in IDE**: Open your IDE and ask the agent questions like:
    *   "How does the Billing module work?"
    *   "Find dead code in the Admin panel."
    *   "Generate an API contract for the User Controller."

## Architecture

*   **Frontend**: React + Vite + Tailwind CSS (Dashboard, Visualization).
*   **Backend**: Node.js + Express (MCP Server, API, Git integration).
*   **Agent**: The AI model (Gemini/Claude) interacts with the backend via MCP tools (`read_file`, `search_codebase`, etc.).

## Troubleshooting

*   **Logs**: Check the **System Logs** page in the dashboard for real-time server events and errors.
*   **Simulation Mode**: If the backend cannot connect to real services (Git/Qdrant), it falls back to simulation mode for demonstration purposes.
