import { useState, useMemo } from 'react';
import { Plus, MonitorPlay, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { VideoPlan, VideoSegment } from '../types';
import { generateId } from '@/utils/idGenerator';
import SegmentCard from './SegmentCard';
import TeleprompterView from './TeleprompterView';

interface VideoPlanViewProps {
  plan: VideoPlan;
  segments: VideoSegment[];
  onAddSegment: (segment: VideoSegment) => void;
  onUpdateSegment: (id: string, changes: Partial<VideoSegment>) => void;
  onDeleteSegment: (id: string) => void;
  onReorderSegments: (segmentIds: string[]) => void;
}

export default function VideoPlanView({
  plan,
  segments,
  onAddSegment,
  onUpdateSegment,
  onDeleteSegment,
  onReorderSegments,
}: VideoPlanViewProps) {
  const [isTeleprompter, setIsTeleprompter] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const sortedSegments = useMemo(() => {
    return [...segments].sort((a, b) => a.order - b.order);
  }, [segments]);

  const handleAddSegment = () => {
    const newSegment: VideoSegment = {
      id: generateId('vsg'),
      videoPlanId: plan.id,
      projectId: plan.projectId,
      order: sortedSegments.length,
      title: `Segment ${sortedSegments.length + 1}`,
      script: '',
      visualType: 'camera',
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    onAddSegment(newSegment);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (id: string) => {
    setDragOverId(id);
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDragOverId(null);

    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      return;
    }

    const draggedIndex = sortedSegments.findIndex(s => s.id === draggedId);
    const targetIndex = sortedSegments.findIndex(s => s.id === targetId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const newOrder = [...sortedSegments];
      [newOrder[draggedIndex], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[draggedIndex]];
      onReorderSegments(newOrder.map(s => s.id));
    }

    setDraggedId(null);
  };

  const handleExportPlan = () => {
    const exportData = {
      plan: {
        title: plan.title,
        totalDuration: plan.totalDuration,
      },
      segments: sortedSegments.map(seg => ({
        title: seg.title,
        startTime: seg.startTime,
        endTime: seg.endTime,
        speakerName: seg.speakerName,
        script: seg.script,
        visualType: seg.visualType,
        visualDescription: seg.visualDescription,
        audioNotes: seg.audioNotes,
        notes: seg.notes,
        tags: seg.tags,
      })),
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${plan.title}-plan.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isTeleprompter) {
    return (
      <TeleprompterView
        segments={sortedSegments}
        onExit={() => setIsTeleprompter(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="font-serif text-2xl text-neutral-50">{plan.title}</h2>
            {plan.totalDuration && (
              <p className="text-sm text-accent-gold mt-1">Total Duration: {plan.totalDuration}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportPlan}
              className="flex items-center gap-2 px-4 py-2 rounded bg-surface border border-border hover:border-accent-gold/50 text-neutral-300 hover:text-accent-gold transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => setIsTeleprompter(true)}
              className="flex items-center gap-2 px-4 py-2 rounded bg-accent-gold text-deep font-medium hover:bg-accent-gold/90 transition-colors text-sm"
            >
              <MonitorPlay className="w-4 h-4" />
              Teleprompter
            </button>
          </div>
        </div>
        {sortedSegments.length > 0 && (
          <p className="text-xs text-neutral-400">
            {sortedSegments.length} segment{sortedSegments.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Segments list */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {sortedSegments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-neutral-400 mb-4">No segments yet. Create your first segment to get started.</p>
              <button
                onClick={handleAddSegment}
                className="inline-flex items-center gap-2 px-4 py-2 rounded bg-accent-gold text-deep font-medium hover:bg-accent-gold/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Segment
              </button>
            </div>
          ) : (
            <>
              {sortedSegments.map((segment) => (
                <motion.div
                  key={segment.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onDragOver={handleDragOver}
                  onDragEnter={() => handleDragEnter(segment.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, segment.id)}
                  className={`transition-colors ${
                    dragOverId === segment.id ? 'bg-deep/50' : ''
                  }`}
                >
                  <SegmentCard
                    segment={segment}
                    index={sortedSegments.indexOf(segment)}
                    onUpdate={onUpdateSegment}
                    onDelete={onDeleteSegment}
                    isDragging={draggedId === segment.id}
                    onDragStart={handleDragStart}
                  />
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Add segment button */}
        {sortedSegments.length > 0 && (
          <button
            onClick={handleAddSegment}
            className="w-full py-3 rounded border border-dashed border-border hover:border-accent-gold/50 text-neutral-400 hover:text-accent-gold transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Segment
          </button>
        )}
      </div>
    </div>
  );
}
