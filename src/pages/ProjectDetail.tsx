import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Download, Settings2, X, Grip, ChevronUp, ChevronDown } from 'lucide-react';
import { useProject } from '@/hooks/useProjects';
import { getEnginesByIds, getAllEngines } from '@/engines';
import TopBar from '@/components/layout/TopBar';
import Modal from '@/components/common/Modal';
import { updateProject } from '@/db/operations';

export default function ProjectDetail() {
  const { id, tab } = useParams<{ id: string; tab?: string }>();
  const { project, loading } = useProject(id);
  const [showEngineManager, setShowEngineManager] = useState(false);

  // Get enabled engines from project
  const engines = project
    ? getEnginesByIds(project.engineOrder || project.enabledEngines || [])
    : [];

  // Active tab state
  const [activeEngineId, setActiveEngineId] = useState<string>('');

  // Set initial active engine from URL or first engine
  useEffect(() => {
    if (engines.length > 0 && !activeEngineId) {
      setActiveEngineId(tab || engines[0].id);
    }
  }, [engines, activeEngineId, tab]);

  const activeEngine = engines.find((e) => e.id === activeEngineId);

  const handleExport = async () => {
    if (!id) return;
    try {
      // Dynamically import to avoid issues in non-browser contexts
      const { exportProjectData } = await import('@/db/operations');
      const data = await exportProjectData(id);
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project?.title || 'project'}-export.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-text-muted">Project not found</p>
      </div>
    );
  }

  return (
    <>
      <TopBar
        title={project.title}
        subtitle={`${project.type} · ${project.status}`}
      />

      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Tab bar */}
        <div className="flex items-center gap-1 px-6 py-2 border-b border-border bg-surface/50 overflow-x-auto flex-shrink-0">
          {engines.map((engine) => {
            const Icon = engine.icon;
            return (
              <button
                key={engine.id}
                onClick={() => setActiveEngineId(engine.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap transition ${
                  activeEngineId === engine.id
                    ? 'bg-accent-gold/15 text-accent-gold font-semibold'
                    : 'text-text-muted hover:text-text-primary hover:bg-elevated'
                }`}
              >
                <Icon size={16} />
                {engine.name}
              </button>
            );
          })}

          <div className="flex-1" />

          {/* Engine Manager button */}
          <button
            onClick={() => setShowEngineManager(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-text-muted hover:text-text-primary transition"
            title="Manage engines"
          >
            <Settings2 size={14} />
          </button>

          {/* Export button */}
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-text-muted hover:text-text-primary transition"
            title="Export project"
          >
            <Download size={14} />
            Export
          </button>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeEngine ? (
            <activeEngine.component projectId={id!} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-text-muted">No engines enabled</p>
            </div>
          )}
        </div>
      </div>

      {/* Engine Manager Modal */}
      <EngineManager
        open={showEngineManager}
        onClose={() => setShowEngineManager(false)}
        project={project}
        onUpdate={async (enabledEngines, engineOrder) => {
          if (id) {
            await updateProject(id, {
              enabledEngines,
              engineOrder,
            });
            setShowEngineManager(false);
          }
        }}
      />
    </>
  );
}

interface EngineManagerProps {
  open: boolean;
  onClose: () => void;
  project: any;
  onUpdate: (enabledEngines: string[], engineOrder: string[]) => Promise<void>;
}

function EngineManager({
  open,
  onClose,
  project,
  onUpdate,
}: EngineManagerProps) {
  const allEngines = getAllEngines();
  const [enabledIds, setEnabledIds] = useState<string[]>(
    project.enabledEngines || []
  );
  const [order, setOrder] = useState<string[]>(
    project.engineOrder || project.enabledEngines || []
  );
  const [saving, setSaving] = useState(false);

  // Sync state when modal opens
  useEffect(() => {
    if (open) {
      setEnabledIds(project.enabledEngines || []);
      setOrder(project.engineOrder || project.enabledEngines || []);
    }
  }, [open, project]);

  const toggleEngine = (engineId: string) => {
    setEnabledIds((prev) => {
      if (prev.includes(engineId)) {
        // Disable: remove from both lists
        setOrder((o) => o.filter((id) => id !== engineId));
        return prev.filter((id) => id !== engineId);
      } else {
        // Enable: add to end of order
        setOrder((o) => [...o, engineId]);
        return [...prev, engineId];
      }
    });
  };

  const moveUp = (engineId: string) => {
    const idx = order.indexOf(engineId);
    if (idx <= 0) return;
    const newOrder = [...order];
    [newOrder[idx], newOrder[idx - 1]] = [newOrder[idx - 1], newOrder[idx]];
    setOrder(newOrder);
  };

  const moveDown = (engineId: string) => {
    const idx = order.indexOf(engineId);
    if (idx >= order.length - 1) return;
    const newOrder = [...order];
    [newOrder[idx], newOrder[idx + 1]] = [newOrder[idx + 1], newOrder[idx]];
    setOrder(newOrder);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate(enabledIds, order);
    } finally {
      setSaving(false);
    }
  };

  const disabledEngines = allEngines.filter((e) => !enabledIds.includes(e.id));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Engine Manager"
      wide={false}
    >
      <div className="space-y-6">
        {/* Enabled Engines - Reorderable */}
        <div>
          <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-accent-gold rounded-full" />
            Active Engines
          </h3>
          {order.length === 0 ? (
            <p className="text-sm text-text-dim text-center py-4">
              No engines enabled. Add one below.
            </p>
          ) : (
            <div className="space-y-2 bg-elevated rounded-lg p-3">
              {order.map((engineId, idx) => {
                const engine = allEngines.find((e) => e.id === engineId);
                if (!engine) return null;
                const Icon = engine.icon;
                return (
                  <div
                    key={engineId}
                    className="flex items-center gap-2 p-3 bg-surface rounded-lg border border-border/50"
                  >
                    <Grip size={16} className="text-text-dim cursor-move" />
                    <Icon size={16} className="text-text-muted flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {engine.name}
                      </p>
                      <p className="text-xs text-text-dim truncate">
                        {engine.description}
                      </p>
                    </div>

                    {/* Reorder buttons */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => moveUp(engineId)}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg text-text-muted hover:bg-elevated disabled:opacity-40 disabled:cursor-not-allowed transition"
                        title="Move up"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        onClick={() => moveDown(engineId)}
                        disabled={idx === order.length - 1}
                        className="p-1.5 rounded-lg text-text-muted hover:bg-elevated disabled:opacity-40 disabled:cursor-not-allowed transition"
                        title="Move down"
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => toggleEngine(engineId)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition flex-shrink-0"
                      title="Disable engine"
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Available Engines */}
        {disabledEngines.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-text-dim rounded-full" />
              Available Engines
            </h3>
            <div className="space-y-2 bg-elevated rounded-lg p-3 max-h-64 overflow-y-auto">
              {disabledEngines.map((engine) => {
                const Icon = engine.icon;
                return (
                  <button
                    key={engine.id}
                    onClick={() => toggleEngine(engine.id)}
                    className="w-full flex items-center gap-3 p-3 bg-surface rounded-lg border border-border/50 hover:border-accent-gold/30 hover:bg-surface/80 transition text-left group"
                  >
                    <Icon size={16} className="text-text-muted flex-shrink-0 group-hover:text-accent-gold transition" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate group-hover:text-accent-gold transition">
                        {engine.name}
                      </p>
                      <p className="text-xs text-text-dim truncate">
                        {engine.description}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-accent-gold/10 text-accent-gold flex-shrink-0">
                      Add
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 justify-end pt-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-elevated text-text-primary hover:bg-elevated/80 transition text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-accent-gold text-surface hover:bg-accent-amber disabled:opacity-60 transition text-sm font-medium"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
