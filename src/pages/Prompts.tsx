import { useState } from 'react';
import { Terminal, Plus, Edit2, Trash2, Play, BookOpen, SearchCode, GitMerge, FileWarning } from 'lucide-react';
import { Card, CardContent, CardHeader, Badge, Button } from '../components/ui';

export function Prompts() {
  const [prompts] = useState([
    {
      id: 'legacy-discovery',
      name: 'Yii2 Module Discovery',
      description: 'Instructs the LLM to map implicit domains across Yii2 Modules, ActiveRecords, and Console Controllers.',
      type: 'system',
      icon: SearchCode,
      tools: ['search_codebase', 'read_ast', 'save_architectural_decision']
    },
    {
      id: 'doc-gen-api',
      name: 'Yii2 API Doc Generator',
      description: 'Generates OpenAPI specs from Yii2 REST Controllers and urlManager rules.',
      type: 'task',
      icon: BookOpen,
      tools: ['read_file', 'list_directory']
    },
    {
      id: 'dead-code-hunter',
      name: 'Dead Code & Deprecation Hunter',
      description: 'Finds unused Gii-generated views, obsolete console commands, and disconnected React components.',
      type: 'task',
      icon: FileWarning,
      tools: ['search_codebase', 'get_git_history', 'read_ast']
    },
    {
      id: 'refactor-to-react',
      name: 'Yii2 View to React Refactor',
      description: 'Guides the agent in converting a legacy Yii2 PHP view (Blade/Smarty/PHP) into a React component.',
      type: 'task',
      icon: GitMerge,
      tools: ['read_file', 'search_codebase', 'create_file']
    }
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">MCP Prompts</h1>
          <p className="text-gray-400">Manage the specialized instructions and toolsets exposed to the IDE Agent.</p>
        </div>
        <Button className="w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          New Prompt
        </Button>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {prompts.map((prompt) => (
          <Card key={prompt.id} className="group hover:border-[var(--color-accent)]/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center border border-white/10">
                      <prompt.icon className="w-4 h-4 text-gray-400 group-hover:text-[var(--color-accent)] transition-colors" />
                    </div>
                    <h3 className="text-lg font-medium text-white">{prompt.name}</h3>
                    <Badge variant={prompt.type === 'system' ? 'warning' : 'default'}>
                      {prompt.type}
                    </Badge>
                  </div>
                  <p className="text-gray-400 text-sm mb-4">
                    {prompt.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs text-gray-500 font-medium mr-2 self-center">Exposed Tools:</span>
                    {prompt.tools.map(tool => (
                      <Badge key={tool} variant="default" className="font-mono text-[10px] bg-black/50">
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex md:flex-col gap-2 justify-end md:justify-start border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
                  <Button variant="outline" className="flex-1 md:flex-none justify-start">
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" className="flex-1 md:flex-none justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:border-red-500/20">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
