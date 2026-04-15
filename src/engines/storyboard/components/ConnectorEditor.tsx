// ============================================
// Storyboard Engine — Connector Editor Modal
// ============================================

import { useState, useEffect } from 'react';
import Modal from '@/components/common/Modal';
import type { StoryboardConnector } from '../types';

interface ConnectorEditorProps {
  isOpen: boolean;
  connector: StoryboardConnector | null;
  storyboardId: string;
  fromPanelId: string;
  toPanelId: string;
  onClose: () => void;
  onSave: (connector: StoryboardConnector) => void;
  onDelete?: (connectorId: string) => void;
}

const CONNECTOR_TYPES: Array<{ id: StoryboardConnector['type']; label: string; symbol: string; desc: string }> = [
  { id: 'arrow', label: 'Arrow', symbol: '→', desc: 'Simple continuation' },
  { id: 'cut', label: 'Cut', symbol: '|', desc: 'Abrupt transition' },
  { id: 'fade', label: 'Fade', symbol: '◇', desc: 'Fade to black' },
  { id: 'dissolve', label: 'Dissolve', symbol: '◊', desc: 'Smooth transition' },
  { id: 'note', label: 'Note', symbol: '◆', desc: 'Scene note/annotation' },
  { id: 'custom', label: 'Custom', symbol: '•', desc: 'Custom symbol' },
];

export default function ConnectorEditor({
  isOpen,
  connector,
  storyboardId,
  fromPanelId,
  toPanelId,
  onClose,
  onSave,
  onDelete,
}: ConnectorEditorProps) {
  const [formData, setFormData] = useState<Partial<StoryboardConnector>>(
    connector || { type: 'arrow', label: '', symbol: '' }
  );

  useEffect(() => {
    if (connector) {
      setFormData(connector);
    } else {
      setFormData({ type: 'arrow', label: '', symbol: '' });
    }
  }, [connector, isOpen]);

  const handleSave = () => {
    const connectorData: StoryboardConnector = {
      id: connector?.id || `conn-${Date.now()}`,
      storyboardId,
      sourceId: fromPanelId,
      targetId: toPanelId,
      type: (formData.type || 'arrow') as StoryboardConnector['type'],
      label: (formData.label || '').trim() || undefined,
      symbol: (formData.symbol || '').trim() || undefined,
    };
    onSave(connectorData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal open={isOpen} onClose={onClose} title={connector ? 'Edit Connector' : 'Create Connector'}>
      <div className="space-y-6 max-w-lg">
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-3">Transition Type</label>
          <div className="grid grid-cols-2 gap-2">
            {CONNECTOR_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setFormData(prev => ({ ...prev, type: type.id }))}
                className={`p-3 rounded-lg border-2 text-left transition ${
                  formData.type === type.id
                    ? 'border-accent-gold bg-accent-gold/10'
                    : 'border-border bg-surface hover:border-accent-gold'
                }`}
              >
                <div className="text-xl font-bold text-accent-gold mb-1">{type.symbol}</div>
                <div className="font-semibold text-text-primary text-sm">{type.label}</div>
                <div className="text-text-muted text-xs">{type.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-primary mb-2">Label (optional)</label>
          <input
            type="text"
            value={formData.label || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
            placeholder="e.g., '5 min later', 'Meanwhile...'"
            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary placeholder-text-muted focus:border-accent-gold focus:outline-none transition"
          />
          <p className="text-text-muted text-xs mt-1">Custom text to display on the connector</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-primary mb-2">Custom Symbol (optional)</label>
          <input
            type="text"
            value={formData.symbol || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value }))}
            placeholder="e.g., '⚡', '💭', '>>'"
            maxLength={3}
            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary placeholder-text-muted focus:border-accent-gold focus:outline-none transition"
          />
          <p className="text-text-muted text-xs mt-1">Override the default symbol (single character or emoji)</p>
        </div>

        <div className="flex gap-3 pt-4 border-t border-border">
          {connector && onDelete && (
            <button
              onClick={() => {
                if (confirm('Delete this connector?')) {
                  onDelete(connector.id);
                  onClose();
                }
              }}
              className="px-4 py-2 bg-red-600/10 border border-red-600 text-red-600 rounded-lg hover:bg-red-600/20 transition font-semibold text-sm"
            >
              Delete
            </button>
          )}
          <div className="flex-1 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-surface border border-border text-text-primary rounded-lg hover:bg-elevated transition font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-accent-gold text-deep rounded-lg hover:bg-accent-amber transition font-semibold"
            >
              Save Connector
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
