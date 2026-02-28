import express from 'express';
import { createServer as createViteServer } from 'vite';
import simpleGit from 'simple-git';

const app = express();
const PORT = 3000;
const git = simpleGit();

// Middleware to parse JSON bodies
app.use(express.json());

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
  ignoredPaths: ['node_modules', 'dist', '.git', '.env']
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
  const { projectRoot, ignoredPaths } = req.body;
  if (projectRoot) systemConfig.projectRoot = projectRoot;
  if (ignoredPaths) systemConfig.ignoredPaths = ignoredPaths;
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
    ignoredPaths: systemConfig.ignoredPaths
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
  });
}

startServer();
