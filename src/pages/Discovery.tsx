import { useState } from 'react';
import { BrainCircuit, MessageSquare, Check, ChevronRight, Sparkles, FileCode2, Database, Network, TerminalSquare, Server } from 'lucide-react';
import { Card, CardContent, CardHeader, Button, Badge } from '../components/ui';

type DiscoveryStep = {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed';
  icon: any;
  executor: 'MCP Server' | 'IDE Agent';
};

export function Discovery() {
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const steps: DiscoveryStep[] = [
    {
      id: 'static-analysis',
      title: 'Static AST Parsing & Indexing',
      description: 'Running PHP-Parser and TypeScript compiler API in the background to build the raw code graph.',
      status: currentStep > 0 ? 'completed' : currentStep === 0 && isDiscovering ? 'active' : 'pending',
      icon: Server,
      executor: 'MCP Server'
    },
    {
      id: 'architecture',
      title: 'Architecture Pattern Recognition',
      description: 'Detecting Yii2 structure: ActiveRecords, Behaviors, Modules, and mixed raw SQL/Query Builder usage.',
      status: currentStep > 1 ? 'completed' : currentStep === 1 && isDiscovering ? 'active' : 'pending',
      icon: Network,
      executor: 'MCP Server'
    },
    {
      id: 'semantic-discovery',
      title: 'Semantic Domain Discovery',
      description: 'Executing the "Yii2 Module Discovery" prompt. The LLM uses MCP tools to find implicit domains.',
      status: currentStep > 2 ? 'completed' : currentStep === 2 && isDiscovering ? 'active' : 'pending',
      icon: BrainCircuit,
      executor: 'IDE Agent'
    },
    {
      id: 'data-models',
      title: 'Data Model Mapping',
      description: 'Analyzing Yii2 ActiveRecords, DAO (raw SQL), and Query Builder calls to understand data flow.',
      status: currentStep > 3 ? 'completed' : currentStep === 3 && isDiscovering ? 'active' : 'pending',
      icon: Database,
      executor: 'MCP Server'
    }
  ];

  const handleStartDiscovery = () => {
    setIsDiscovering(true);
    setCurrentStep(0);
    
    // Simulate discovery process
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) {
          clearInterval(interval);
          setIsDiscovering(false);
          return prev + 1;
        }
        return prev + 1;
      });
    }, 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Project Discovery</h1>
          <p className="text-gray-400">Coordinate static analysis (Server) and semantic reasoning (IDE Agent).</p>
        </div>
        <Button 
          onClick={handleStartDiscovery} 
          disabled={isDiscovering || currentStep >= steps.length}
          className="whitespace-nowrap"
        >
          {currentStep >= steps.length ? (
            <>
              <Check className="w-4 h-4" />
              Discovery Complete
            </>
          ) : isDiscovering && currentStep >= 2 ? (
            <>
              <TerminalSquare className="w-4 h-4" />
              Waiting for IDE Agent...
            </>
          ) : isDiscovering ? (
            <>
              <Server className="w-4 h-4 animate-pulse" />
              Server Processing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Initialize Discovery
            </>
          )}
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Discovery Pipeline */}
        <Card className="lg:col-span-1">
          <CardHeader title="Execution Pipeline" subtitle="Split between Server and LLM" />
          <CardContent className="p-0">
            <div className="divide-y divide-white/5">
              {steps.map((step) => (
                <div 
                  key={step.id} 
                  className={`p-4 transition-colors ${step.status === 'active' ? 'bg-[var(--color-accent)]/5' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${
                      step.status === 'completed' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' :
                      step.status === 'active' ? 'bg-[var(--color-accent)]/20 border-[var(--color-accent)]/50 text-[var(--color-accent)] animate-pulse' :
                      'bg-white/5 border-white/10 text-gray-500'
                    }`}>
                      {step.status === 'completed' ? <Check className="w-4 h-4" /> : <step.icon className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className={`text-sm font-medium truncate ${step.status === 'active' ? 'text-white' : step.status === 'completed' ? 'text-gray-300' : 'text-gray-500'}`}>
                          {step.title}
                        </h3>
                        <Badge variant={step.executor === 'MCP Server' ? 'default' : 'warning'} className="text-[10px] px-1.5 py-0">
                          {step.executor}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Extracted Context & Q&A */}
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader 
            title="Saved Architectural Decisions" 
            subtitle="Knowledge persisted by the IDE Agent via MCP tools"
            action={
              currentStep >= steps.length && (
                <Badge variant="success">Synced to DB</Badge>
              )
            }
          />
          <CardContent className="flex-1 flex flex-col gap-6">
            {currentStep === 0 && !isDiscovering ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-white/10 rounded-xl">
                <BrainCircuit className="w-12 h-12 text-gray-600 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No Decisions Recorded</h3>
                <p className="text-sm text-gray-400 max-w-md">
                  Trigger the discovery prompt in your IDE. The agent will analyze the code and use the <code className="text-[var(--color-accent)]">save_decision</code> tool to record findings here.
                </p>
              </div>
            ) : (
              <>
                {/* Extracted Domains (Simulated result of step 3) */}
                <div className={`space-y-3 transition-opacity duration-500 ${currentStep > 2 ? 'opacity-100' : 'opacity-30'}`}>
                  <h4 className="text-sm font-medium text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-[var(--color-accent)]" />
                    Domains Saved to Vector DB
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-white">Billing (Legacy)</span>
                        <Badge>Scattered</Badge>
                      </div>
                      <p className="text-xs text-gray-400 font-mono">
                        Found in: /app/controllers/Payment.php, /src/react/Checkout, /cron/billing.php
                      </p>
                    </div>
                    <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-white">Admin Panel</span>
                        <Badge variant="warning">Mixed Tech</Badge>
                      </div>
                      <p className="text-xs text-gray-400 font-mono">
                        Found in: /admin_html, /api/admin, /app/models/Admin.php
                      </p>
                    </div>
                  </div>
                </div>

                {/* Agent Q&A (Interactive clarification) */}
                <div className={`flex-1 flex flex-col border border-white/10 rounded-xl overflow-hidden transition-opacity duration-500 ${currentStep > 3 ? 'opacity-100' : 'opacity-0'}`}>
                  <div className="bg-white/5 px-4 py-2 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TerminalSquare className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-medium text-gray-300">IDE Chat Transcript (Saved via Tool)</span>
                    </div>
                    <Badge variant="default" className="text-[10px]">Read-Only</Badge>
                  </div>
                  <div className="flex-1 p-4 space-y-4 bg-[#0a0a0a]">
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded bg-[var(--color-accent)]/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <BrainCircuit className="w-3 h-3 text-[var(--color-accent)]" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-300 bg-white/5 p-3 rounded-lg rounded-tl-none border border-white/10">
                          I noticed billing logic is split between Yii2 ActiveRecords (<code className="text-[var(--color-accent)] bg-[var(--color-accent)]/10 px-1 rounded">common/models/Payment.php</code>), console commands (<code className="text-[var(--color-accent)] bg-[var(--color-accent)]/10 px-1 rounded">console/controllers/BillingController.php</code>), and the new React frontend.
                          <br/><br/>
                          Should I document the legacy Gii-generated CRUD views in <code className="text-[var(--color-accent)] bg-[var(--color-accent)]/10 px-1 rounded">backend/views/payment</code>, or focus only on the REST API?
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 flex-row-reverse">
                      <div className="w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-xs text-blue-400 font-bold">U</span>
                      </div>
                      <div>
                        <p className="text-sm text-white bg-blue-500/20 p-3 rounded-lg rounded-tr-none border border-blue-500/30">
                          Focus on the API and React. The Gii-generated views in backend are for internal admins only, but we are moving them to React too.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded bg-[var(--color-accent)]/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <BrainCircuit className="w-3 h-3 text-[var(--color-accent)]" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 italic bg-white/5 p-3 rounded-lg rounded-tl-none border border-white/10">
                          Action: Calling tool <code className="text-[var(--color-accent)]">save_architectural_decision</code> with context "Billing views in /admin_html are deprecated. Focus on API + React."
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
