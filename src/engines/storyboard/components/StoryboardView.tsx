// ============================================
// Storyboard Engine — Main View Component
// ============================================

import { useState, useMemo } from 'react';
import { Plus, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { StoryboardPanel as StoryboardPanelType, Storyboard, StoryboardConnector } from '../types';
import { generateId } from '@/utils/idGenerator';
import StoryboardPanel from './StoryboardPanel';
import PanelEditor from './PanelEditor';
import ConnectorBadge from './ConnectorBadge';
import ConnectorEditor from './ConnectorEditor';

interface StoryboardViewProps {
  storyboard: Storyboard;
  panels: StoryboardPanelType[];
  connectors: StoryboardConnector[];
  onAddPanel: (panel: StoryboardPanelType) => void;
  onUpdatePanel: (id: string, changes: Partial<StoryboardPanelType>) => void;
  onDeletePanel: (id: string) => void;
  onReorderPanels: (panelIds: string[]) => void;
  onAddConnector: (connector: StoryboardConnector) => void;
  onUpdateConnector: (id: string, changes: Partial<StoryboardConnector>) => void;
  onDeleteConnector: (id: string) => void;
  onUpdateStoryboard: (id: string, changes: Partial<Storyboard>) => void;
}

export default function StoryboardView({
  storyboard,
  panels,
  connectors,
  onAddPanel,
  onUpdatePanel,
  onDeletePanel,
  onReorderPanels,
  onAddConnector,
  onUpdateConnector,
  onDeleteConnector,
  onUpdateStoryboard,
}: StoryboardViewProps) {
  const [editingPanel, setEditingPanel] = useState<StoryboardPanelType | null>(null);
  const [editingConnectorFrom, setEditingConnectorFrom] = useState<string>('');
  const [editingConnectorTo, setEditingConnectorTo] = useState<string>('');
  const [isReordering, setIsReordering] = useState(false);
  const [draggedPanel, setDraggedPanel] = useState<string | null>(null);

  const sortedPanels = useMemo(() => {
    return [...panels].sort((a, b) => a.order - b.order);
  }, [panels]);

  const getConnectorBetween = (fromId: string, toId: string): StoryboardConnector | undefined => {
    return connectors.find(c => c.sourceId === fromId && c.targetId === toId);
  };

  const handleAddPanel = () => {
    const newPanel: StoryboardPanelType = {
      id: generateId('sbp'),
      storyboardId: storyboard.id,
      projectId: storyboard.projectId,
      order: sortedPanels.length,
      subtitle: '',
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    onAddPanel(newPanel);
    setEditingPanel(newPanel);
  };

  const handleSavePanel = (panel: StoryboardPanelType) => {
    if (editingPanel?.id === panel.id) {
      onUpdatePanel(panel.id, panel);
    } else {
      onAddPanel(panel);
    }
    setEditingPanel(null);
  };

  const handleDeletePanel = (id: string) => {
    onDeletePanel(id);
  };

  const handleUpdateSubtitle = (id: string, subtitle: string) => {
    onUpdatePanel(id, { subtitle });
  };

  const handleConnectorEdit = (fromId: string, toId: string) => {
    setEditingConnectorFrom(fromId);
    setEditingConnectorTo(toId);
  };

  const handleSaveConnector = (connector: StoryboardConnector) => {
    const existing = getConnectorBetween(connector.sourceId, connector.targetId);
    if (existing) {
      onUpdateConnector(existing.id, connector);
    } else {
      onAddConnector(connector);
    }
  };

  const handleDeleteConnector = (id: string) => {
    onDeleteConnector(id);
  };

  const handleDragStart = (panelId: string) => {
    if (!isReordering) return;
    setDraggedPanel(panelId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropPanel = (targetPanelId: string) => {
    if (!draggedPanel || draggedPanel === targetPanelId || !isReordering) return;

    const draggedIdx = sortedPanels.findIndex(p => p.id === draggedPanel);
    const targetIdx = sortedPanels.findIndex(p => p.id === targetPanelId);

    if (draggedIdx === -1 || targetIdx === -1) return;

    const newPanels = [...sortedPanels];
    const [draggedItem] = newPanels.splice(draggedIdx, 1);
    newPanels.splice(targetIdx, 0, draggedItem);

    const newOrder = newPanels.map(p => p.id);
    onReorderPanels(newOrder);
    setDraggedPanel(null);
  };

  // Group panels into rows based on columns
  const rows = useMemo(() => {
    const rowArray: StoryboardPanelType[][] = [];
    for (let i = 0; i < sortedPanels.length; i += storyboard.columns) {
      rowArray.push(sortedPanels.slice(i, i + storyboard.columns));
    }
    return rowArray;
  }, [sortedPanels, storyboard.columns]);

  if (sortedPanels.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-serif font-bold text-accent-gold">Storyboard: {storyboard.title}</h2>
        </div>
        <div className="border border-border rounded-xl bg-surface/50 p-12 text-center space-y-4">
          <div className="flex justify-center">
            <Zap size={48} className="text-text-muted opacity-50" />
          </div>
          <h3 className="text-lg font-serif font-bold text-text-primary">No panels yet</h3>
          <p className="text-text-muted">Start building your storyboard by adding your first panel</p>
          <button
            onClick={handleAddPanel}
            className="inline-block px-4 py-2 bg-accent-gold text-deep rounded-lg hover:bg-accent-amber transition font-semibold"
          >
            Add Panel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-serif font-bold text-accent-gold">Storyboard: {storyboard.title}</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-text-muted">Columns:</label>
            <select
              value={storyboard.columns}
              onChange={(e) => onUpdateStoryboard(storyboard.id, { columns: parseInt(e.target.value, 10) })}
              className="px-2 py-1 bg-surface border border-border rounded text-sm text-text-primary focus:border-accent-gold focus:outline-none transition"
            >
              {[2, 3, 4, 5, 6].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setIsReordering(!isReordering)}
            className={`px-3 py-1 rounded text-sm font-semibold transition ${
              isReordering
                ? 'bg-accent-gold text-deep hover:bg-accent-amber'
                : 'bg-surface border border-border text-text-primary hover:border-accent-gold'
            }`}
          >
            {isReordering ? 'Done Ordering' : 'Reorder'}
          </button>
          <button
            onClick={handleAddPanel}
            className="flex items-center gap-1.5 px-3 py-1 bg-accent-gold text-deep rounded font-semibold text-sm hover:bg-accent-amber transition"
          >
            <Plus size={16} />
            Panel
          </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="space-y-4">
        <AnimatePresence>
          {rows.map((row, rowIdx) => (
            <motion.div
              key={`row-${rowIdx}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Row of Panels */}
              <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${storyboard.columns}, 1fr)` }}>
                {row.map((panel) => (
                  <div
                    key={panel.id}
                    draggable={isReordering}
                    onDragStart={() => handleDragStart(panel.id)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDropPanel(panel.id)}
                    className={isReordering ? 'opacity-75' : ''}
                  >
                    <StoryboardPanel
                      panel={panel}
                      isReordering={isReordering}
                      onEdit={setEditingPanel}
                      onDelete={handleDeletePanel}
                      onUpdateSubtitle={handleUpdateSubtitle}
                    />
                  </div>
                ))}
              </div>

              {/* Connectors between panels in the same row */}
              {rowIdx < rows.length && (
                <div className="grid gap-6 grid-rows-subgrid" style={{ gridTemplateColumns: `repeat(${storyboard.columns}, 1fr)` }}>
                  {row.map((panel) => {
                    const panelPosition = row.indexOf(panel);
                    if (panelPosition === row.length - 1) return null; // No connector after last panel
                    const nextPanel = row[panelPosition + 1];
                    const connector = getConnectorBetween(panel.id, nextPanel.id);
                    return (
                      <div key={`conn-${panel.id}-${nextPanel.id}`} className="flex items-center justify-center pb-4">
                        <ConnectorBadge
                          connector={connector || null}
                          fromPanelId={panel.id}
                          toPanelId={nextPanel.id}
                          onEdit={handleConnectorEdit}
                          onDelete={() => connector && handleDeleteConnector(connector.id)}
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Vertical connectors to next row */}
              {rowIdx < rows.length - 1 && (
                <div className="my-2">
                  {row.map((panel) => {
                    const nextRowPanel = rows[rowIdx + 1]?.[0];
                    if (!nextRowPanel) return null;
                    const connector = getConnectorBetween(panel.id, nextRowPanel.id);
                    return (
                      <div key={`vconn-${panel.id}`} className="flex justify-center mb-2">
                        <ConnectorBadge
                          connector={connector || null}
                          fromPanelId={panel.id}
                          toPanelId={nextRowPanel.id}
                          onEdit={handleConnectorEdit}
                          onDelete={() => connector && handleDeleteConnector(connector.id)}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Panel Editor Modal */}
      <PanelEditor
        panel={editingPanel}
        isOpen={!!editingPanel}
        onClose={() => setEditingPanel(null)}
        onSave={handleSavePanel}
      />

      {/* Connector Editor Modal */}
      <ConnectorEditor
        isOpen={!!editingConnectorFrom}
        connector={getConnectorBetween(editingConnectorFrom, editingConnectorTo) || null}
        storyboardId={storyboard.id}
        fromPanelId={editingConnectorFrom}
        toPanelId={editingConnectorTo}
        onClose={() => {
          setEditingConnectorFrom('');
          setEditingConnectorTo('');
        }}
        onSave={handleSaveConnector}
        onDelete={handleDeleteConnector}
      />
    </div>
  );
}
