// ============================================
// Brainstorm Engine — Item Editor Modal
// ============================================

import { useState, useRef } from 'react';
import { X } from 'lucide-react';
import TiptapEditor from '@/components/editor/TiptapEditor';
import type { BrainstormItem } from '../types';

interface BrainstormItemEditorProps {
  item: BrainstormItem;
  onSave: (changes: Partial<BrainstormItem>) => void;
  onClose: () => void;
}

const NOTE_COLORS = ['yellow', 'pink', 'blue', 'green', 'purple'] as const;

const SECTION_COLORS = [
  '#6b7280', // gray
  '#fbbf24', // amber
  '#f87171', // red
  '#60a5fa', // blue
  '#10b981', // emerald
];

export default function BrainstormItemEditor({ item, onSave, onClose }: BrainstormItemEditorProps) {
  const [changes, setChanges] = useState<Partial<BrainstormItem>>(item);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    onSave(changes);
    onClose();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setChanges({ ...changes, imageData: result });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-surface border border-border rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-surface border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">
            Edit {item.type}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-text-muted hover:text-text-primary transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {item.type === 'note' && (
            <>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Color
                </label>
                <div className="flex gap-2">
                  {NOTE_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setChanges({ ...changes, color })}
                      className={`w-8 h-8 rounded-full border-2 transition ${
                        changes.color === color
                          ? 'border-accent-gold'
                          : 'border-transparent'
                      }`}
                      style={{
                        backgroundColor: {
                          yellow: '#fef3c7',
                          pink: '#fce7f3',
                          blue: '#dbeafe',
                          green: '#d1fae5',
                          purple: '#ede9fe',
                        }[color],
                      }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Content
                </label>
                <textarea
                  value={changes.content || ''}
                  onChange={(e) => setChanges({ ...changes, content: e.target.value })}
                  placeholder="Write your note..."
                  className="w-full h-32 px-3 py-2 bg-elevated border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-gold"
                />
              </div>
            </>
          )}

          {item.type === 'image' && (
            <>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Image
                </label>
                {changes.imageData && (
                  <img
                    src={changes.imageData}
                    alt="Preview"
                    className="w-full h-auto rounded-lg mb-3"
                  />
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-2 bg-accent-gold/10 text-accent-gold rounded-lg hover:bg-accent-gold/20 transition text-sm font-medium"
                >
                  Upload Image
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </>
          )}

          {item.type === 'text-block' && (
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Content
              </label>
              <TiptapEditor
                content={changes.richContent || ''}
                onChange={(html) => setChanges({ ...changes, richContent: html })}
                placeholder="Write your text block..."
              />
            </div>
          )}

          {item.type === 'section' && (
            <>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Label
                </label>
                <input
                  type="text"
                  value={changes.label || ''}
                  onChange={(e) => setChanges({ ...changes, label: e.target.value })}
                  placeholder="Section name..."
                  className="w-full px-3 py-2 bg-elevated border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-gold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Color
                </label>
                <div className="flex gap-2 flex-wrap">
                  {SECTION_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setChanges({ ...changes, sectionColor: color })}
                      className={`w-8 h-8 rounded-full border-2 transition ${
                        changes.sectionColor === color
                          ? 'border-accent-gold'
                          : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          {item.type === 'entity-ref' && (
            <div className="p-3 rounded-lg bg-elevated border border-border">
              <p className="text-xs text-text-muted">
                Entity references are read-only. Created via the entity picker.
              </p>
              <p className="text-sm font-medium text-text-primary mt-2">
                {item.refEntityType}: {item.refEntityId}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-surface border-t border-border px-6 py-4 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-elevated text-text-primary rounded-lg hover:bg-elevated/80 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-accent-gold/10 text-accent-gold rounded-lg hover:bg-accent-gold/20 transition font-medium"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
