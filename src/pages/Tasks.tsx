import { useState, useRef, useEffect } from 'react';
import { Play, Square, Terminal, Loader2, CheckCircle2, ChevronRight, Search, FileCode } from 'lucide-react';
import { Card, CardContent, CardHeader, Button, Badge } from '../components/ui';

type LogEntry = {
  id: number;
  type: 'info' | 'tool_call' | 'tool_result' | 'thought' | 'success' | 'error';
  message: string;
  details?: string;
  timestamp: string;
};

export function Tasks() {
  const [query, setQuery] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  const handleRun = () => {
    if (!query.trim() || isRunning) return;
    
    setIsRunning(true);
    setLogs([]);
    
    // Simulate agent execution
    const simulatedSteps: Omit<LogEntry, 'id' | 'timestamp'>[] = [
      { type: 'info', message: 'Starting documentation generation task...' },
      { type: 'thought', message: `I need to find all code related to "${query}". I'll start by searching the semantic index.` },
      { type: 'tool_call', message: `search_codebase(query: "${query}", limit: 10)` },
      { type: 'tool_result', message: 'Found 8 relevant files. Top matches: src/services/billing.ts, src/controllers/stripe.ts, src/models/Subscription.ts' },
      { type: 'thought', message: 'I will read the core billing service file to understand the business logic.' },
      { type: 'tool_call', message: 'read_file(path: "src/services/billing.ts")' },
      { type: 'tool_result', message: 'File read successfully (450 lines). Contains classes: BillingService, InvoiceGenerator.' },
      { type: 'thought', message: 'Now I need to find the API endpoints that expose this service.' },
      { type: 'tool_call', message: 'search_codebase(query: "router.post(\'/billing", limit: 5)' },
      { type: 'tool_result', message: 'Found 2 endpoints in src/routes/api.ts: POST /billing/subscribe, POST /billing/cancel' },
      { type: 'thought', message: 'I have enough context. I will now synthesize the documentation using the collected metadata.' },
      { type: 'info', message: 'Generating Markdown documentation...' },
      { type: 'success', message: 'Documentation generated successfully. Saved to /docs/billing-system.md' },
    ];

    let stepIndex = 0;
    
    const interval = setInterval(() => {
      if (stepIndex < simulatedSteps.length) {
        const step = simulatedSteps[stepIndex];
        setLogs(prev => [...prev, {
          ...step,
          id: Date.now(),
          timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }]);
        stepIndex++;
      } else {
        clearInterval(interval);
        setIsRunning(false);
      }
    }, 1500); // 1.5s delay between steps to simulate thinking/network
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 h-full flex flex-col">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Agent Task Runner</h1>
        <p className="text-gray-400">Dictate actions to the IDE agent to gather project documentation.</p>
      </header>

      <Card className="flex-shrink-0">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Gather documentation for..."
                className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-lg leading-5 bg-[#0a0a0a] text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] sm:text-sm transition-colors"
                disabled={isRunning}
                onKeyDown={(e) => e.key === 'Enter' && handleRun()}
              />
            </div>
            <Button 
              onClick={isRunning ? () => setIsRunning(false) : handleRun}
              variant={isRunning ? 'outline' : 'primary'}
              className={`w-full sm:w-auto ${isRunning ? 'border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300' : ''}`}
            >
              {isRunning ? (
                <>
                  <Square className="w-4 h-4 fill-current" />
                  Stop Agent
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  Run Task
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="flex-1 flex flex-col min-h-[400px] border-white/10 bg-[#0a0a0a]">
        <CardHeader 
          title="Execution Log" 
          subtitle="Real-time MCP tool calls and agent reasoning"
          action={
            isRunning && (
              <div className="flex items-center gap-2 text-[var(--color-accent)] text-sm font-mono">
                <Loader2 className="w-4 h-4 animate-spin" />
                Agent is thinking...
              </div>
            )
          }
        />
        <CardContent className="flex-1 overflow-y-auto p-0 font-mono text-sm">
          {logs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4 p-12">
              <Terminal className="w-12 h-12 opacity-20" />
              <p>Enter a query above to start the documentation agent.</p>
            </div>
          ) : (
            <div className="p-4 space-y-1">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-4 py-2 hover:bg-white/5 px-2 rounded transition-colors group">
                  <span className="text-gray-600 shrink-0 select-none">[{log.timestamp}]</span>
                  
                  <div className="flex-1 min-w-0">
                    {log.type === 'info' && (
                      <span className="text-blue-400">{log.message}</span>
                    )}
                    {log.type === 'thought' && (
                      <span className="text-gray-400 italic flex items-center gap-2">
                        <ChevronRight className="w-3 h-3" />
                        {log.message}
                      </span>
                    )}
                    {log.type === 'tool_call' && (
                      <div className="text-[var(--color-accent)] flex items-start gap-2">
                        <FileCode className="w-4 h-4 mt-0.5 shrink-0" />
                        <span className="break-all">{log.message}</span>
                      </div>
                    )}
                    {log.type === 'tool_result' && (
                      <div className="text-gray-300 pl-6 border-l-2 border-white/10 ml-2 mt-1 py-1">
                        {log.message}
                      </div>
                    )}
                    {log.type === 'success' && (
                      <span className="text-emerald-400 font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        {log.message}
                      </span>
                    )}
                    {log.type === 'error' && (
                      <span className="text-red-400 font-bold">{log.message}</span>
                    )}
                  </div>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
