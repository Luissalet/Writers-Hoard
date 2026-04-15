// ============================================
// Storyboard Engine — Root Component
// ============================================

import { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import type { EngineComponentProps } from '@/engines/_types';
import { useStoryboards, useStoryboardPanels, useStoryboardConnectors } from './hooks';
import { generateId } from '@/utils/idGenerator';
import StoryboardView from './components/StoryboardView';

export default function StoryboardEngine({ projectId }: EngineComponentProps) {
  const { storyboards, loading: storyboardsLoading, addStoryboard, updateStoryboard, deleteStoryboard } = useStoryboards(projectId);
  const [activeStoryboardId, setActiveStoryboardId] = useState<string>('');
  const [showNewStoryboard, setShowNewStoryboard] = useState(false);
  const [newStoryboardName, setNewStoryboardName] = useState('');

  const { panels, addPanel, updatePanel, deletePanel, reorderPanels } = useStoryboardPanels(activeStoryboardId);
  const { connectors, addConnector, updateConnector, deleteConnector } = useStoryboardConnectors(activeStoryboardId);

  // Auto-set first storyboard as active
  useEffect(() => {
    if (storyboards.length > 0 && !activeStoryboardId) {
      setActiveStoryboardId(storyboards[0].id);
    }
  }, [storyboards, activeStoryboardId]);

  // Ensure at least one storyboard exists
  useEffect(() => {
    const ensureStoryboard = async () => {
      if (storyboardsLoading) return;
      if (storyboards.length === 0) {
        const sb = {
          id: generateId('sb'),
          projectId,
          title: 'Main Storyboard',
          columns: 3,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        await addStoryboard(sb);
        setActiveStoryboardId(sb.id);
      }
    };
    ensureStoryboard();
  }, [projectId, storyboardsLoading, storyboards.length, addStoryboard]);

  const activeStoryboard = useMemo(
    () => storyboards.find(s => s.id === activeStoryboardId),
    [storyboards, activeStoryboardId]
  );

  const handleCreateStoryboard = async () => {
    if (!newStoryboardName.trim()) return;
    const sb = {
      id: generateId('sb'),
      projectId,
      title: newStoryboardName.trim(),
      columns: 3,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await addStoryboard(sb);
    setActiveStoryboardId(sb.id);
    setNewStoryboardName('');
    setShowNewStoryboard(false);
  };

  const handleDeleteStoryboard = async (storyboardId: string) => {
    if (!confirm(`Delete storyboard "${storyboards.find(s => s.id === storyboardId)?.title || 'Unnamed'}"? All its panels and connectors will be lost.`)) {
      return;
    }
    await deleteStoryboard(storyboardId);
    if (activeStoryboardId === storyboardId) {
      const remaining = storyboards.filter(s => s.id !== storyboardId);
      if (remaining.length > 0) {
        setActiveStoryboardId(remaining[0].id);
      } else {
        setActiveStoryboardId('');
      }
    }
  };

  if (storyboardsLoading && storyboards.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-accent-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Storyboard View */}
      {activeStoryboard && (
        <StoryboardView
          storyboard={activeStoryboard}
          panels={panels}
          connectors={connectors}
          onAddPanel={addPanel}
          onUpdatePanel={updatePanel}
          onDeletePanel={deletePanel}
          onReorderPanels={reorderPanels}
          onAddConnector={addConnector}
          onUpdateConnector={updateConnector}
          onDeleteConnector={deleteConnector}
          onUpdateStoryboard={updateStoryboard}
        />
      )}

      {/* Storyboards List */}
      <div className="border border-border rounded-xl bg-surface/50 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-text-primary">Your Storyboards</h3>
          <button
            onClick={() => setShowNewStoryboard(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-accent-gold text-deep rounded font-semibold text-sm hover:bg-accent-amber transition"
          >
            <Plus size={14} />
            New
          </button>
        </div>

        {/* New Storyboard Form */}
        {showNewStoryboard && (
          <div className="mb-4 p-3 bg-elevated rounded-lg flex gap-2">
            <input
              autoFocus
              type="text"
              value={newStoryboardName}
              onChange={(e) => setNewStoryboardName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateStoryboard();
                if (e.key === 'Escape') {
                  setShowNewStoryboard(false);
                  setNewStoryboardName('');
                }
              }}
              placeholder="Storyboard name"
              className="flex-1 px-3 py-1 bg-surface border border-border rounded text-sm text-text-primary placeholder-text-muted focus:border-accent-gold focus:outline-none"
            />
            <button
              onClick={handleCreateStoryboard}
              className="px-3 py-1 bg-accent-gold text-deep rounded font-semibold text-sm hover:bg-accent-amber transition"
            >
              Create
            </button>
            <button
              onClick={() => {
                setShowNewStoryboard(false);
                setNewStoryboardName('');
              }}
              className="px-2 py-1 text-text-muted hover:text-text-primary transition"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Storyboards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {storyboards.map((sb) => (
            <button
              key={sb.id}
              onClick={() => setActiveStoryboardId(sb.id)}
              className={`p-3 rounded-lg border-2 text-left transition ${
                activeStoryboardId === sb.id
                  ? 'border-accent-gold bg-accent-gold/10'
                  : 'border-border bg-surface hover:border-accent-gold'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-text-primary text-sm mb-1">{sb.title}</h4>
                  <p className="text-text-muted text-xs">{panels.length} panels • {sb.columns} columns</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteStoryboard(sb.id);
                  }}
                  className="p-1 text-red-600 hover:text-red-700 transition opacity-0 hover:opacity-100"
                  title="Delete storyboard"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
