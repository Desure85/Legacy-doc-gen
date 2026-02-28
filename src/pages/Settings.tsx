import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Folder, GitBranch, Server, Shield, RefreshCw, Save, Plus, X } from 'lucide-react';
import { Card, CardContent, CardHeader, Button, Badge, Input } from '../components/ui';
import { get, post } from '../services/api';
import { useToast } from '../components/ToastContext';

type Config = {
  projectRoot: string;
  gitBranch: string;
  mcpPort: number;
  nodeVersion: string;
  ignoredPaths: string[];
  useGitIgnore?: boolean;
};

export function Settings() {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Config>>({});
  const [newPath, setNewPath] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = () => {
    setLoading(true);
    get('/config')
      .then(data => {
        setConfig(data);
        setFormData(data);
      })
      .catch(err => {
        console.error("Failed to load config", err);
        showToast('Failed to load configuration', 'error');
      })
      .finally(() => setLoading(false));
  };

  const handleSave = async () => {
    try {
      await post('/config', {
        projectRoot: formData.projectRoot,
        ignoredPaths: formData.ignoredPaths,
        useGitIgnore: formData.useGitIgnore
      });
      setIsEditing(false);
      showToast('Configuration saved successfully', 'success');
      loadConfig();
    } catch (err) {
      console.error("Failed to save config", err);
      showToast('Failed to save configuration', 'error');
    }
  };

  const addIgnoredPath = () => {
    if (newPath && !formData.ignoredPaths?.includes(newPath)) {
      setFormData({
        ...formData,
        ignoredPaths: [...(formData.ignoredPaths || []), newPath]
      });
      setNewPath('');
    }
  };

  const removeIgnoredPath = (path: string) => {
    setFormData({
      ...formData,
      ignoredPaths: formData.ignoredPaths?.filter(p => p !== path)
    });
  };

  if (loading) {
    return <div className="p-8 text-gray-400">Loading configuration...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Server Configuration</h1>
          <p className="text-gray-400">Manage how the MCP server interacts with your local environment.</p>
        </div>
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <Button variant="ghost" onClick={() => { setIsEditing(false); setFormData(config || {}); }}>Cancel</Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Edit Configuration
            </Button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Local Environment" icon={Server} />
          <CardContent className="space-y-4">
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <Folder className="w-5 h-5 text-[var(--color-accent)]" />
                <span className="text-sm font-medium text-gray-300">Project Root</span>
              </div>
              {isEditing ? (
                <Input 
                  value={formData.projectRoot || ''} 
                  onChange={e => setFormData({...formData, projectRoot: e.target.value})} 
                  className="font-mono text-xs"
                />
              ) : (
                <code className="block bg-black/30 p-2 rounded text-xs font-mono text-gray-400 break-all">
                  {config?.projectRoot}
                </code>
              )}
              <p className="text-xs text-gray-500 mt-2">
                The MCP server uses this directory as the source of truth for all file operations.
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center gap-3">
                <GitBranch className="w-5 h-5 text-[var(--color-accent)]" />
                <div>
                  <p className="text-sm font-medium text-gray-300">Active Branch</p>
                  <p className="text-xs text-gray-500">Currently tracked by Indexer</p>
                </div>
              </div>
              <Badge variant="outline" className="font-mono">{config?.gitBranch}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Security & Scope" icon={Shield} />
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
              <input
                type="checkbox"
                id="useGitIgnore"
                checked={isEditing ? (formData.useGitIgnore ?? true) : (config?.useGitIgnore ?? true)}
                onChange={e => setFormData({...formData, useGitIgnore: e.target.checked})}
                disabled={!isEditing}
                className="w-4 h-4 rounded border-gray-600 bg-black/20 text-[var(--color-accent)] focus:ring-[var(--color-accent)] cursor-pointer"
              />
              <div className="flex-1">
                <label htmlFor="useGitIgnore" className={`text-sm font-medium ${isEditing ? 'cursor-pointer text-white' : 'text-gray-300'}`}>
                  Respect .gitignore
                </label>
                <p className="text-xs text-gray-500">
                  Automatically exclude files listed in .gitignore from indexing and analysis.
                </p>
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-sm font-medium text-gray-300 mb-3">Ignored Paths</p>
              
              {isEditing && (
                <div className="flex gap-2 mb-3">
                  <Input 
                    value={newPath} 
                    onChange={e => setNewPath(e.target.value)} 
                    placeholder="Add path (e.g. tests/)" 
                    className="h-8 text-xs"
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addIgnoredPath())}
                  />
                  <Button variant="secondary" className="h-8 px-3" onClick={addIgnoredPath}>
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {(isEditing ? formData.ignoredPaths : config?.ignoredPaths)?.map(path => (
                  <span key={path} className="flex items-center gap-1 px-2 py-1 bg-black/30 rounded text-xs font-mono text-gray-400 border border-white/5">
                    {path}
                    {isEditing && (
                      <button onClick={() => removeIgnoredPath(path)} className="text-gray-500 hover:text-red-400 ml-1">
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                These directories are excluded from AST parsing and vector indexing to improve performance.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
