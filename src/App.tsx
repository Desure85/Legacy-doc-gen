import { useState } from 'react';
import { LayoutDashboard, Database, Terminal, FileText, Settings, Menu, X, BrainCircuit, Network } from 'lucide-react';
import { Dashboard } from './pages/Dashboard';
import { Prompts } from './pages/Prompts';
import { Tasks } from './pages/Tasks';
import { Docs } from './pages/Docs';
import { Discovery } from './pages/Discovery';
import { ArchitectureMap } from './pages/ArchitectureMap';

type Page = 'dashboard' | 'discovery' | 'architecture' | 'prompts' | 'tasks' | 'docs';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'discovery', label: 'Project Discovery', icon: BrainCircuit },
    { id: 'architecture', label: 'Architecture Map', icon: Network },
    { id: 'prompts', label: 'MCP Prompts', icon: Terminal },
    { id: 'tasks', label: 'Agent Tasks', icon: Database },
    { id: 'docs', label: 'Generated Docs', icon: FileText },
  ];

  const handleNavClick = (id: Page) => {
    setCurrentPage(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--color-bg)] text-white font-sans">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b border-[var(--color-border)] bg-[var(--color-bg)] z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-[var(--color-accent)]/10 border border-[var(--color-accent)] flex items-center justify-center">
            <Terminal className="w-4 h-4 text-[var(--color-accent)]" />
          </div>
          <h1 className="font-semibold tracking-tight text-sm">DocuGen MCP</h1>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-gray-400 hover:text-white focus:outline-none"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40
        w-64 border-r border-[var(--color-border)] flex flex-col bg-[var(--color-bg)] shrink-0
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="hidden md:block p-6 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-[var(--color-accent)]/10 border border-[var(--color-accent)] flex items-center justify-center">
              <Terminal className="w-4 h-4 text-[var(--color-accent)]" />
            </div>
            <div>
              <h1 className="font-semibold tracking-tight text-sm">DocuGen MCP</h1>
              <p className="text-xs text-gray-500 font-mono">v1.0.0-beta</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 mt-16 md:mt-0 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id as Page)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                currentPage === item.id
                  ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-[var(--color-border)]">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative pt-16 md:pt-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,255,204,0.03),transparent_40%)] pointer-events-none" />
        <div className="p-4 md:p-8 max-w-6xl mx-auto h-full">
          {currentPage === 'dashboard' && <Dashboard />}
          {currentPage === 'discovery' && <Discovery />}
          {currentPage === 'architecture' && <ArchitectureMap />}
          {currentPage === 'prompts' && <Prompts />}
          {currentPage === 'tasks' && <Tasks />}
          {currentPage === 'docs' && <Docs />}
        </div>
      </main>
    </div>
  );
}
