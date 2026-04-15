import { Trash2, GripVertical } from 'lucide-react';
import { motion } from 'framer-motion';
import type { DialogBlock } from '../types';

interface DialogBlockComponentProps {
  block: DialogBlock;
  onUpdate: (content: string, parenthetical?: string) => void;
  onDelete: () => void;
  isDragging?: boolean;
  dragHandleProps?: any;
}

export default function DialogBlockComponent({
  block,
  onUpdate,
  onDelete,
  isDragging,
  dragHandleProps,
}: DialogBlockComponentProps) {
  const isStageDirection = block.type === 'stage-direction';

  if (isStageDirection) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="group relative mb-3"
      >
        <div
          className={`rounded-lg border border-border px-4 py-3 bg-elevated/50 transition ${
            isDragging ? 'opacity-50' : ''
          }`}
        >
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <p className="text-sm italic text-text-muted text-center">
                {block.content}
              </p>
            </div>
            <button
              onClick={onDelete}
              className="opacity-0 group-hover:opacity-100 p-1 text-text-dim hover:text-danger hover:bg-danger/10 rounded transition flex-shrink-0"
              title="Delete block"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="group relative mb-3"
    >
      <div
        className={`rounded-lg border border-border overflow-hidden transition ${
          isDragging ? 'opacity-50' : ''
        }`}
      >
        {/* Character name bar with color stripe */}
        <div
          className="px-4 py-2 flex items-center gap-2 border-b border-border"
          style={{ backgroundColor: block.characterColor + '15' }}
        >
          <div
            className="w-1.5 h-6 rounded-full flex-shrink-0"
            style={{ backgroundColor: block.characterColor }}
          />
          <span className="text-sm font-semibold text-text-primary flex-1">
            {block.characterName}
          </span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
            <button
              {...dragHandleProps}
              className="p-1 text-text-dim hover:text-text-primary cursor-grab active:cursor-grabbing transition"
              title="Drag to reorder"
            >
              <GripVertical size={14} />
            </button>
            <button
              onClick={onDelete}
              className="p-1 text-text-dim hover:text-danger hover:bg-danger/10 rounded transition"
              title="Delete block"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Dialog content */}
        <div className="px-4 py-3 bg-elevated">
          {block.parenthetical && (
            <p className="text-xs italic text-text-muted mb-2">
              ({block.parenthetical})
            </p>
          )}
          <textarea
            value={block.content}
            onChange={(e) => onUpdate(e.target.value, block.parenthetical)}
            className="w-full bg-elevated text-text-primary text-sm resize-none focus:outline-none border-none p-0 font-serif leading-relaxed"
            rows={Math.max(2, Math.ceil(block.content.length / 60))}
            placeholder="Enter dialog..."
          />
        </div>
      </div>
    </motion.div>
  );
}
