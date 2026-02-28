import { Activity, Database, FileCode2, Layers, Search, Zap, GitBranch, GitCommit, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, Badge, Button } from '../components/ui';

export function Dashboard() {
  const stats = [
    { label: 'Indexed Files', value: '1,248', icon: FileCode2, trend: '+12 this week' },
    { label: 'Vector Embeddings', value: '45.2k', icon: Database, trend: 'Using text-embedding-3-small' },
    { label: 'AST Nodes Parsed', value: '3.1M', icon: Layers, trend: 'TypeScript, Python, Go' },
    { label: 'Avg Search Latency', value: '124ms', icon: Zap, trend: '-15ms since last update' },
  ];

  const recentActivity = [
    { id: 1, action: 'Synced branch "feature/stripe-billing"', target: '12 files updated', time: '10 mins ago', status: 'success' },
    { id: 2, action: 'Generated docs', target: 'Stripe Integration', time: '1 hour ago', status: 'success' },
    { id: 3, action: 'Detected drift (main)', target: '3 files out of sync', time: '3 hours ago', status: 'warning' },
    { id: 4, action: 'Agent Task Failed', target: 'Legacy Auth', time: '1 day ago', status: 'error' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">System Overview</h1>
          <p className="text-gray-400">Monitor your codebase semantic index and MCP server status.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm">
            <GitBranch className="w-4 h-4 text-gray-400" />
            <select className="bg-transparent text-white focus:outline-none cursor-pointer">
              <option value="main">main</option>
              <option value="feature/stripe-billing">feature/stripe-billing</option>
              <option value="hotfix/auth">hotfix/auth</option>
            </select>
          </div>
          <Badge variant="warning">Syncing (45%)</Badge>
          <Button variant="outline" className="text-xs py-1.5 h-auto whitespace-nowrap">
            <RefreshCw className="w-3 h-3 mr-1" />
            Sync Index
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="bg-[var(--color-card)]/50 backdrop-blur-sm border-white/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                  <stat.icon className="w-5 h-5 text-[var(--color-accent)]" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold tracking-tight text-white">{stat.value}</h3>
                <p className="text-sm font-medium text-gray-400 mt-1">{stat.label}</p>
                <p className="text-xs text-gray-500 mt-2 font-mono">{stat.trend}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader title="Semantic Index Health" subtitle="Vector database status and chunking metrics" />
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Storage Capacity</span>
                  <span className="text-[var(--color-accent)] font-mono">68%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--color-accent)] w-[68%] rounded-full" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Active Branch</p>
                  <p className="text-lg font-mono text-white flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-[var(--color-accent)]" />
                    feature/stripe-billing
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Last Commit Indexed</p>
                  <p className="text-lg font-mono text-white flex items-center gap-2">
                    <GitCommit className="w-4 h-4 text-gray-400" />
                    a1b2c3d
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Embedding Model</p>
                  <p className="text-lg font-mono text-white">gemini-embedding</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Sync Strategy</p>
                  <p className="text-lg font-mono text-white">Webhook (Push)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Recent Activity" />
          <CardContent className="p-0">
            <div className="divide-y divide-white/5">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="p-4 flex items-start gap-3 hover:bg-white/5 transition-colors">
                  <div className={`mt-0.5 w-2 h-2 rounded-full ${activity.status === 'success' ? 'bg-[var(--color-accent)]' : 'bg-red-500'}`} />
                  <div>
                    <p className="text-sm font-medium text-white">{activity.action}</p>
                    <p className="text-xs text-gray-400 font-mono mt-1">{activity.target}</p>
                    <p className="text-xs text-gray-500 mt-2">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
