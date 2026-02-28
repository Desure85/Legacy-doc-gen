import { useState, useEffect } from 'react';
import { Terminal, RefreshCw, Filter, Search, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, Button, Input, Badge } from '../components/ui';
import { get } from '../services/api';
import { useToast } from '../components/ToastContext';

type LogEntry = {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
};

export function Logs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | 'info' | 'warn' | 'error'>('all');
  const { showToast } = useToast();

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await get('/logs');
      setLogs(data);
    } catch (err) {
      console.error("Failed to fetch logs", err);
      showToast('Failed to fetch system logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000); // Auto-refresh every 5s
    return () => clearInterval(interval);
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesText = log.message.toLowerCase().includes(filter.toLowerCase()) || 
                        log.id.toLowerCase().includes(filter.toLowerCase());
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
    return matchesText && matchesLevel;
  });

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error': return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'warn': return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      default: return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'warn': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      default: return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">System Logs</h1>
          <p className="text-gray-400">Real-time server events and diagnostic information.</p>
        </div>
        <Button onClick={fetchLogs} disabled={loading} variant="outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </header>

      <Card className="flex flex-col h-[600px]">
        <div className="p-4 border-b border-[var(--color-border)] flex flex-wrap gap-4 items-center justify-between bg-[var(--color-card)]">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-gray-500" />
            <Input 
              placeholder="Search logs..." 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-transparent border-none focus:ring-0 px-0 h-auto"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select 
              className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-sm px-2 py-1 text-gray-300 focus:outline-none focus:border-[var(--color-accent)]"
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value as any)}
            >
              <option value="all">All Levels</option>
              <option value="info">Info</option>
              <option value="warn">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>
        
        <CardContent className="flex-1 overflow-auto p-0 font-mono text-sm">
          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2">
              <Terminal className="w-8 h-8 opacity-50" />
              <p>No logs found matching your criteria</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-white/5 sticky top-0 backdrop-blur-sm z-10">
                <tr>
                  <th className="p-3 font-medium text-gray-400 w-48">Timestamp</th>
                  <th className="p-3 font-medium text-gray-400 w-24">Level</th>
                  <th className="p-3 font-medium text-gray-400">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-3 text-gray-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString()} <span className="text-xs opacity-50">{new Date(log.timestamp).toLocaleDateString()}</span>
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border ${getLevelColor(log.level)}`}>
                        {getLevelIcon(log.level)}
                        {log.level.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-gray-300 group-hover:text-white transition-colors break-all">
                      {log.message}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
