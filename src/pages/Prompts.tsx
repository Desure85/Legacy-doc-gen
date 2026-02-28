import { useState, useEffect } from 'react';
import { Terminal, Plus, Edit2, Trash2, BookOpen, SearchCode, GitMerge, FileWarning } from 'lucide-react';
import { Card, CardContent, Badge, Button, Modal, Input, Textarea } from '../components/ui';
import { get, post, put, del } from '../services/api';
import { useToast } from '../components/ToastContext';

type Prompt = {
  id: string;
  name: string;
  description: string;
  type: 'system' | 'task';
  icon?: any;
  tools: string[];
};

const iconMap: Record<string, any> = {
  'auto-discovery': SearchCode,
  'api-contract-gen': BookOpen,
  'dead-code-hunter': FileWarning,
  'refactor-assistant': GitMerge,
  'default': Terminal
};

export function Prompts() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [formData, setFormData] = useState<Partial<Prompt>>({});
  const { showToast } = useToast();

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = () => {
    get('/prompts').then((data: any[]) => {
      // Map icons back (since JSON doesn't store components)
      const mapped = data.map(p => ({
        ...p,
        icon: iconMap[p.id] || iconMap['default']
      }));
      setPrompts(mapped);
    }).catch(err => {
      console.error(err);
      showToast('Failed to load prompts', 'error');
    });
  };

  const handleEdit = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setFormData(prompt);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setEditingPrompt(null);
    setFormData({ type: 'task', tools: [] });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this prompt?')) {
      try {
        await del(`/prompts/${id}`);
        showToast('Prompt deleted successfully', 'success');
        loadPrompts();
      } catch (err) {
        showToast('Failed to delete prompt', 'error');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      tools: typeof formData.tools === 'string' ? (formData.tools as string).split(',').map(t => t.trim()) : formData.tools
    };

    try {
      if (editingPrompt) {
        await put(`/prompts/${editingPrompt.id}`, payload);
        showToast('Prompt updated successfully', 'success');
      } else {
        await post('/prompts', payload);
        showToast('Prompt created successfully', 'success');
      }
      setIsModalOpen(false);
      loadPrompts();
    } catch (err) {
      showToast('Failed to save prompt', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">MCP Prompts</h1>
          <p className="text-gray-400">Manage the specialized instructions and toolsets exposed to the IDE Agent.</p>
        </div>
        <Button className="w-full sm:w-auto" onClick={handleNew}>
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
                      {prompt.icon && <prompt.icon className="w-4 h-4 text-gray-400 group-hover:text-[var(--color-accent)] transition-colors" />}
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
                  <Button variant="outline" className="flex-1 md:flex-none justify-start" onClick={() => handleEdit(prompt)}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" className="flex-1 md:flex-none justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:border-red-500/20" onClick={() => handleDelete(prompt.id)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPrompt ? 'Edit Prompt' : 'New Prompt'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
            <Input 
              value={formData.name || ''} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              placeholder="e.g. API Generator"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
            <select 
              className="flex h-10 w-full rounded-md border border-[var(--color-border)] bg-black/20 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              value={formData.type || 'task'}
              onChange={e => setFormData({...formData, type: e.target.value as any})}
            >
              <option value="task">Task</option>
              <option value="system">System</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
            <Textarea 
              value={formData.description || ''} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
              placeholder="Describe what this prompt does..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Tools (comma separated)</label>
            <Input 
              value={Array.isArray(formData.tools) ? formData.tools.join(', ') : formData.tools || ''} 
              onChange={e => setFormData({...formData, tools: e.target.value as any})} 
              placeholder="read_file, list_directory"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editingPrompt ? 'Save Changes' : 'Create Prompt'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
