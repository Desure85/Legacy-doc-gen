import { useState } from 'react';
import { Network, Search, Filter, ZoomIn, ZoomOut, Maximize2, GitMerge, Database, Server, LayoutTemplate } from 'lucide-react';
import { Card, CardContent, CardHeader, Badge, Button } from '../components/ui';

export function ArchitectureMap() {
  const [activeFilter, setActiveFilter] = useState('all');

  const nodes = [
    { id: 'react-app', label: 'React Frontend', type: 'frontend', x: 20, y: 20 },
    { id: 'api-gateway', label: 'API Gateway (PHP)', type: 'backend', x: 50, y: 40 },
    { id: 'legacy-admin', label: 'Legacy Admin (PHP)', type: 'legacy', x: 80, y: 20 },
    { id: 'billing-cron', label: 'Billing Cron (PHP)', type: 'backend', x: 80, y: 60 },
    { id: 'main-db', label: 'Main Database (MySQL)', type: 'database', x: 50, y: 80 },
  ];

  const edges = [
    { source: 'react-app', target: 'api-gateway', label: 'REST API' },
    { source: 'api-gateway', target: 'main-db', label: 'PDO Queries' },
    { source: 'legacy-admin', target: 'main-db', label: 'Direct SQL' },
    { source: 'billing-cron', target: 'main-db', label: 'Batch Updates' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 h-full flex flex-col">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Architecture Map</h1>
          <p className="text-gray-400">Visual representation of your monolith's dependencies and data flow.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="px-3">
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="outline" className="px-3">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button variant="outline" className="px-3">
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Filters Sidebar */}
        <Card className="w-full lg:w-64 flex flex-col shrink-0">
          <CardHeader title="Filters" subtitle="Highlight specific layers" />
          <CardContent className="space-y-2 p-4">
            <button 
              onClick={() => setActiveFilter('all')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${activeFilter === 'all' ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
              Show All
            </button>
            <button 
              onClick={() => setActiveFilter('frontend')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${activeFilter === 'frontend' ? 'bg-blue-500/10 text-blue-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
              <LayoutTemplate className="w-4 h-4" />
              Frontend (React)
            </button>
            <button 
              onClick={() => setActiveFilter('backend')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${activeFilter === 'backend' ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
              <Server className="w-4 h-4" />
              Backend API (PHP)
            </button>
            <button 
              onClick={() => setActiveFilter('legacy')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${activeFilter === 'legacy' ? 'bg-amber-500/10 text-amber-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
              <GitMerge className="w-4 h-4" />
              Legacy Views
            </button>
            <button 
              onClick={() => setActiveFilter('database')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${activeFilter === 'database' ? 'bg-purple-500/10 text-purple-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
              <Database className="w-4 h-4" />
              Databases
            </button>
          </CardContent>
        </Card>

        {/* Canvas Area */}
        <Card className="flex-1 relative overflow-hidden bg-[#050505] border-white/10">
          {/* Grid Background */}
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }} />

          {/* Simulated Graph Nodes */}
          <div className="absolute inset-0 p-8">
            {/* Edges (SVG) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {edges.map((edge, i) => {
                const sourceNode = nodes.find(n => n.id === edge.source);
                const targetNode = nodes.find(n => n.id === edge.target);
                if (!sourceNode || !targetNode) return null;
                
                const isFaded = activeFilter !== 'all' && sourceNode.type !== activeFilter && targetNode.type !== activeFilter;

                return (
                  <g key={i} className={`transition-opacity duration-300 ${isFaded ? 'opacity-10' : 'opacity-50'}`}>
                    <line 
                      x1={`${sourceNode.x}%`} y1={`${sourceNode.y}%`} 
                      x2={`${targetNode.x}%`} y2={`${targetNode.y}%`} 
                      stroke="currentColor" 
                      strokeWidth="2"
                      className="text-gray-600"
                      strokeDasharray={edge.label.includes('API') ? '5,5' : 'none'}
                    />
                    <text 
                      x={`${(sourceNode.x + targetNode.x) / 2}%`} 
                      y={`${(sourceNode.y + targetNode.y) / 2 - 2}%`} 
                      fill="currentColor" 
                      className="text-[10px] text-gray-500 font-mono"
                      textAnchor="middle"
                    >
                      {edge.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Nodes (HTML) */}
            {nodes.map((node) => {
              const isActive = activeFilter === 'all' || activeFilter === node.type;
              
              let bgColor = 'bg-gray-800';
              let borderColor = 'border-gray-600';
              let textColor = 'text-gray-300';
              let icon = <Server className="w-5 h-5" />;

              if (node.type === 'frontend') {
                bgColor = 'bg-blue-900/50'; borderColor = 'border-blue-500/50'; textColor = 'text-blue-300';
                icon = <LayoutTemplate className="w-5 h-5" />;
              } else if (node.type === 'backend') {
                bgColor = 'bg-emerald-900/50'; borderColor = 'border-emerald-500/50'; textColor = 'text-emerald-300';
                icon = <Server className="w-5 h-5" />;
              } else if (node.type === 'legacy') {
                bgColor = 'bg-amber-900/50'; borderColor = 'border-amber-500/50'; textColor = 'text-amber-300';
                icon = <GitMerge className="w-5 h-5" />;
              } else if (node.type === 'database') {
                bgColor = 'bg-purple-900/50'; borderColor = 'border-purple-500/50'; textColor = 'text-purple-300';
                icon = <Database className="w-5 h-5" />;
              }

              return (
                <div 
                  key={node.id}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 cursor-pointer hover:scale-105 ${isActive ? 'opacity-100 z-10' : 'opacity-20 z-0'}`}
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                >
                  <div className={`flex flex-col items-center gap-2 p-3 rounded-xl border backdrop-blur-md shadow-xl ${bgColor} ${borderColor}`}>
                    <div className={textColor}>{icon}</div>
                    <span className={`text-xs font-medium whitespace-nowrap ${textColor}`}>{node.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
