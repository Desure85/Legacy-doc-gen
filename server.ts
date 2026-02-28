import express from 'express';
import { createServer as createViteServer } from 'vite';
import simpleGit from 'simple-git';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import ignore from 'ignore';

const app = express();
const PORT = 3000;
const git = simpleGit();

// Create MCP Server
const mcpServer = new McpServer({
  name: "DocuGen",
  version: "1.0.0"
});

// Middleware to parse JSON bodies
app.use(express.json());

// Add permissive CSP middleware
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; connect-src 'self' http://localhost:3000 ws://localhost:3000 https://generativelanguage.googleapis.com; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com;"
  );
  next();
});

// In-memory store for job statuses (simulated database)
const jobs: Record<string, { 
  id: string; 
  type: 'discovery' | 'sync'; 
  status: 'pending' | 'running' | 'completed' | 'failed'; 
  progress: number; 
  currentStep: number;
  logs: string[];
}> = {};

// In-memory store for prompts
let prompts = [
  {
    id: 'auto-discovery',
    name: 'Stack-Agnostic Discovery',
    description: 'Instructs the LLM to identify the tech stack, folder structure, and key architectural patterns automatically.',
    type: 'system',
    tools: ['list_directory', 'read_file', 'save_architectural_decision']
  },
  {
    id: 'api-contract-gen',
    name: 'API Contract Generator',
    description: 'Generates OpenAPI specs by analyzing the boundary between the detected backend and frontend applications.',
    type: 'task',
    tools: ['read_file', 'search_codebase']
  },
  {
    id: 'dead-code-hunter',
    name: 'Dead Code & Deprecation Hunter',
    description: 'Finds unused code, obsolete scripts, and disconnected components across the entire repository.',
    type: 'task',
    tools: ['search_codebase', 'get_git_history', 'read_ast']
  },
  {
    id: 'refactor-assistant',
    name: 'Refactoring Assistant',
    description: 'Guides the agent in modernizing legacy code components based on the detected architecture.',
    type: 'task',
    tools: ['read_file', 'search_codebase', 'create_file']
  }
];

// In-memory store for config
let systemConfig = {
  projectRoot: process.cwd(),
  ignoredPaths: ['node_modules', 'dist', '.git', '.env', '.DS_Store'],
  useGitIgnore: true
};

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(7);

// In-memory store for system logs
const systemLogs: { id: string; timestamp: string; level: 'info' | 'warn' | 'error'; message: string }[] = [];

function log(level: 'info' | 'warn' | 'error', message: string) {
  const newLog = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    level,
    message
  };
  systemLogs.unshift(newLog); // Add to beginning
  // Keep only last 1000 logs
  if (systemLogs.length > 1000) systemLogs.pop();
  console.log(`[${level.toUpperCase()}] ${message}`);
}

// --- GitIgnore Helper ---
async function getIgnoreFilter(root: string) {
  const ig = ignore();
  
  // Always ignore system defaults
  ig.add(systemConfig.ignoredPaths);

  if (systemConfig.useGitIgnore) {
    try {
      const gitignorePath = path.join(root, '.gitignore');
      const gitignoreContent = await fs.readFile(gitignorePath, 'utf-8');
      ig.add(gitignoreContent);
      log('info', 'Loaded .gitignore rules');
    } catch (e) {
      // No .gitignore found, or error reading it
      // log('info', 'No .gitignore found or could not be read');
    }
  }
  
  return ig;
}

// --- MCP Tools Implementation ---

// Helper to resolve path safely
function resolvePath(relativePath: string) {
  const resolved = path.resolve(systemConfig.projectRoot, relativePath);
  if (!resolved.startsWith(systemConfig.projectRoot)) {
    throw new Error("Access denied: Path is outside project root");
  }
  return resolved;
}

mcpServer.tool(
  "list_directory",
  "List files and directories at a specific path.",
  {
    path: z.string().optional().describe("Relative path to list (defaults to root)")
  },
  async ({ path: relativePath }) => {
    const targetPath = resolvePath(relativePath || '.');
    log('info', `MCP Tool called: list_directory (path: ${relativePath || 'root'})`);
    
    try {
      const ig = await getIgnoreFilter(systemConfig.projectRoot);
      const entries = await fs.readdir(targetPath, { withFileTypes: true });
      
      const result = entries
        .filter(entry => {
          const relativeEntryPath = path.relative(systemConfig.projectRoot, path.join(targetPath, entry.name));
          // Check if ignored by .gitignore or system defaults
          // Note: ignore package expects relative paths
          return !ig.ignores(relativeEntryPath);
        })
        .map(entry => ({
          name: entry.name,
          type: entry.isDirectory() ? 'directory' : 'file'
        }));
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify(result, null, 2)
        }]
      };
    } catch (error: any) {
      log('error', `Failed to list directory: ${error.message}`);
      return {
        isError: true,
        content: [{ type: "text", text: `Error: ${error.message}` }]
      };
    }
  }
);

mcpServer.tool(
  "read_file",
  "Read the contents of a file.",
  {
    path: z.string().describe("Relative path to the file")
  },
  async ({ path: relativePath }) => {
    const targetPath = resolvePath(relativePath);
    log('info', `MCP Tool called: read_file (path: ${relativePath})`);
    
    try {
      // Check ignore rules first
      const ig = await getIgnoreFilter(systemConfig.projectRoot);
      if (ig.ignores(relativePath)) {
        throw new Error("File is ignored by configuration");
      }

      const content = await fs.readFile(targetPath, 'utf-8');
      return {
        content: [{
          type: "text",
          text: content
        }]
      };
    } catch (error: any) {
      log('error', `Failed to read file: ${error.message}`);
      return {
        isError: true,
        content: [{ type: "text", text: `Error: ${error.message}` }]
      };
    }
  }
);

mcpServer.tool(
  "analyze_architecture",
  "Analyze the project architecture by reading key config files.",
  {
    path: z.string().optional().describe("Path to analyze (defaults to project root)")
  },
  async ({ path: relativePath }) => {
    log('info', `MCP Tool called: analyze_architecture`);
    const root = resolvePath(relativePath || '.');
    
    const findings: any = {
      stack: [],
      configs: []
    };

    try {
      const files = await fs.readdir(root);
      
      if (files.includes('package.json')) {
        findings.stack.push('Node.js');
        const pkg = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf-8'));
        findings.configs.push('package.json');
        if (pkg.dependencies?.react) findings.stack.push('React');
        if (pkg.dependencies?.vue) findings.stack.push('Vue');
        if (pkg.dependencies?.express) findings.stack.push('Express');
      }
      
      if (files.includes('composer.json')) {
        findings.stack.push('PHP');
        findings.configs.push('composer.json');
        const composer = JSON.parse(await fs.readFile(path.join(root, 'composer.json'), 'utf-8'));
        if (composer.require?.['laravel/framework']) findings.stack.push('Laravel');
        if (composer.require?.['yiisoft/yii2']) findings.stack.push('Yii2');
      }

      if (files.includes('Dockerfile')) findings.stack.push('Docker');

      return {
        content: [{
          type: "text",
          text: JSON.stringify(findings, null, 2)
        }]
      };
    } catch (error: any) {
       return {
        isError: true,
        content: [{ type: "text", text: `Error analyzing architecture: ${error.message}` }]
      };
    }
  }
);

mcpServer.tool(
  "search_codebase",
  "Search the codebase for specific text patterns (simple grep).",
  {
    query: z.string().describe("Text to search for")
  },
  async ({ query }) => {
    log('info', `MCP Tool called: search_codebase (query: ${query})`);
    
    const results: string[] = [];
    const ig = await getIgnoreFilter(systemConfig.projectRoot);
    
    async function searchDir(dir: string) {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(systemConfig.projectRoot, fullPath);

        if (ig.ignores(relativePath)) continue;
        
        if (entry.isDirectory()) {
          await searchDir(fullPath);
        } else {
          try {
            const content = await fs.readFile(fullPath, 'utf-8');
            if (content.includes(query)) {
              results.push(`Found in ${relativePath}`);
            }
          } catch (e) {
            // Ignore binary files or read errors
          }
        }
      }
    }

    await searchDir(systemConfig.projectRoot);

    return {
      content: [{
        type: "text",
        text: results.length > 0 ? results.join('\n') : "No matches found."
      }]
    };
  }
);

// --- API Routes ---

// --- Logs API ---
app.get('/api/logs', (req, res) => {
  res.json(systemLogs);
});

// --- Prompts API ---
app.get('/api/prompts', (req, res) => {
  res.json(prompts);
});

app.post('/api/prompts', (req, res) => {
  const newPrompt = {
    id: generateId(),
    ...req.body
  };
  prompts.push(newPrompt);
  log('info', `Created new prompt: ${newPrompt.name}`);
  res.json(newPrompt);
});

app.put('/api/prompts/:id', (req, res) => {
  const { id } = req.params;
  const index = prompts.findIndex(p => p.id === id);
  if (index === -1) {
    log('warn', `Attempted to update non-existent prompt: ${id}`);
    return res.status(404).json({ error: 'Prompt not found' });
  }
  
  prompts[index] = { ...prompts[index], ...req.body };
  log('info', `Updated prompt: ${prompts[index].name}`);
  res.json(prompts[index]);
});

app.delete('/api/prompts/:id', (req, res) => {
  const { id } = req.params;
  const promptName = prompts.find(p => p.id === id)?.name || id;
  prompts = prompts.filter(p => p.id !== id);
  log('info', `Deleted prompt: ${promptName}`);
  res.json({ success: true });
});

// --- Config API ---
app.post('/api/config', (req, res) => {
  const { projectRoot, ignoredPaths, useGitIgnore } = req.body;
  if (projectRoot) systemConfig.projectRoot = projectRoot;
  if (ignoredPaths) systemConfig.ignoredPaths = ignoredPaths;
  if (useGitIgnore !== undefined) systemConfig.useGitIgnore = useGitIgnore;
  
  log('info', 'Updated system configuration');
  res.json({ success: true, config: systemConfig });
});

// Start Discovery
app.post('/api/discovery/start', (req, res) => {
  const jobId = generateId();
  log('info', `Starting discovery job: ${jobId}`);
  jobs[jobId] = {
    id: jobId,
    type: 'discovery',
    status: 'running',
    progress: 0,
    currentStep: 0,
    logs: ['Discovery started...']
  };

  // Simulate async process
  simulateDiscoveryProcess(jobId);

  res.json({ jobId, status: 'started' });
});

// Get Discovery Status
app.get('/api/discovery/status/:jobId', (req, res) => {
  const job = jobs[req.params.jobId];
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  res.json({
    jobId: job.id,
    isRunning: job.status === 'running',
    currentStep: job.currentStep,
    progress: job.progress,
    logs: job.logs
  });
});

// Stop Discovery
app.post('/api/discovery/stop/:jobId', (req, res) => {
  const job = jobs[req.params.jobId];
  if (job) {
    job.status = 'failed'; // or 'cancelled'
    job.logs.push('Process stopped by user.');
    log('warn', `Stopped discovery job: ${req.params.jobId}`);
  }
  res.json({ status: 'stopped' });
});

// Start Index Sync
app.post('/api/index/sync', (req, res) => {
  const jobId = generateId();
  log('info', `Starting index sync job: ${jobId}`);
  jobs[jobId] = {
    id: jobId,
    type: 'sync',
    status: 'running',
    progress: 0,
    currentStep: 0,
    logs: ['Index sync started...']
  };

  // Simulate async process
  simulateSyncProcess(jobId);

  res.json({ jobId, status: 'started' });
});

// Get Index Status
app.get('/api/index/status/:jobId', (req, res) => {
  const job = jobs[req.params.jobId];
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  res.json({
    jobId: job.id,
    isSyncing: job.status === 'running',
    progress: job.progress
  });
});

// Get System Configuration
app.get('/api/config', async (req, res) => {
  let branch = 'feature/stripe-billing'; // Fallback/Simulation
  
  try {
    const isRepo = await git.checkIsRepo();
    if (isRepo) {
      const status = await git.status();
      branch = status.current || branch;
    }
  } catch (e) {
    console.warn('Failed to read git status:', e);
  }

  res.json({
    projectRoot: systemConfig.projectRoot,
    gitBranch: branch,
    mcpPort: PORT,
    nodeVersion: process.version,
    ignoredPaths: systemConfig.ignoredPaths,
    useGitIgnore: systemConfig.useGitIgnore
  });
});

// --- Simulation Logic (Replace with real logic later) ---

function simulateDiscoveryProcess(jobId: string) {
  let step = 0;
  const maxSteps = 4;
  
  const interval = setInterval(() => {
    const job = jobs[jobId];
    if (!job || job.status !== 'running') {
      clearInterval(interval);
      return;
    }

    step++;
    job.currentStep = step;
    job.progress = Math.round((step / maxSteps) * 100);
    job.logs.push(`Completed step ${step}`);

    if (step >= maxSteps) {
      job.status = 'completed';
      job.logs.push('Discovery completed successfully.');
      clearInterval(interval);
    }
  }, 2000);
}

function simulateSyncProcess(jobId: string) {
  let progress = 0;
  
  const interval = setInterval(() => {
    const job = jobs[jobId];
    if (!job || job.status !== 'running') {
      clearInterval(interval);
      return;
    }

    progress += 10;
    job.progress = progress;
    job.logs.push(`Syncing... ${progress}%`);

    if (progress >= 100) {
      job.status = 'completed';
      job.logs.push('Index sync completed.');
      clearInterval(interval);
    }
  }, 800);
}

// --- MCP SSE Transport Setup ---
let transport: SSEServerTransport | null = null;

app.get('/sse', async (req, res) => {
  log('info', 'New MCP SSE connection established');
  transport = new SSEServerTransport("/messages", res);
  await mcpServer.connect(transport);
});

app.post('/messages', async (req, res) => {
  if (transport) {
    await transport.handlePostMessage(req, res);
  } else {
    res.status(400).json({ error: "No active transport connection" });
  }
});

// --- Vite Middleware Setup ---

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    app.use(express.static('dist'));
    
    // SPA fallback for production
    app.get('*', (req, res) => {
      res.sendFile('index.html', { root: 'dist' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    log('info', `MCP Server running on SSE transport at http://localhost:${PORT}/sse`);
  });
}

startServer();
