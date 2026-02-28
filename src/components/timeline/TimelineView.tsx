import { useState } from 'react';
import { Plus, Trash2, Clock, GripVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TimelineEvent } from '@/types';
import { generateId } from '@/utils/idGenerator';
import Modal from '@/components/common/Modal';
import EmptyState from '@/components/common/EmptyState';

const LANE_COLORS = ['#c4973b', '#7c5cbf', '#4a7ec4', '#4a9e6d', '#c4463a', '#d4a843'];

interface TimelineViewProps {
  projectId: string;
  timelineId: string;
  events: TimelineEvent[];
  onAddEvent: (event: TimelineEvent) => void;
  onEditEvent: (id: string, changes: Partial<TimelineEvent>) => void;
  onDeleteEvent: (id: string) => void;
}

export default function TimelineView({ projectId, timelineId, events, onAddEvent, onEditEvent, onDeleteEvent }: TimelineViewProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    lane: 'Main',
    color: LANE_COLORS[0],
  });

  const lanes = [...new Set(events.map(e => e.lane))];
  if (lanes.length === 0) lanes.push('Main');

  const handleSave = () => {
    if (!form.title.trim()) return;

    if (editingEvent) {
      onEditEvent(editingEvent.id, {
        title: form.title,
        description: form.description,
        date: form.date,
        lane: form.lane,
        color: form.color,
      });
    } else {
      onAddEvent({
        id: generateId('evt'),
        projectId,
        timelineId,
        title: form.title,
        description: form.description,
        date: form.date,
        order: events.length,
        lane: form.lane,
        color: form.color,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    setShowForm(false);
    setEditingEvent(null);
    setForm({ title: '', description: '', date: '', lane: 'Main', color: LANE_COLORS[0] });
  };

  const openEdit = (evt: TimelineEvent) => {
    setForm({ title: evt.title, description: evt.description, date: evt.date, lane: evt.lane, color: evt.color });
    setEditingEvent(evt);
    setShowForm(true);
  };

  const sortedEvents = [...events].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-serif font-bold text-accent-gold">Timeline</h3>
        <button
          onClick={() => { setForm({ title: '', description: '', date: '', lane: 'Main', color: LANE_COLORS[0] }); setEditingEvent(null); setShowForm(true); }}
          className="flex items-center gap-1.5 px-4 py-2 bg-accent-gold text-deep font-semibold text-sm rounded-lg hover:bg-accent-amber transition"
        >
          <Plus size={16} /> Add Event
        </button>
      </div>

      {sortedEvents.length === 0 ? (
        <EmptyState
          icon={<Clock size={40} />}
          title="Empty timeline"
          message="Add events to visualize your story's chronology."
          action={{ label: 'Add First Event', onClick: () => setShowForm(true) }}
        />
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-4">
            <AnimatePresence>
              {sortedEvents.map((evt, i) => (
                <motion.div
                  key={evt.id}
                  className="relative flex items-start gap-4 pl-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  {/* Node dot */}
                  <div
                    className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2"
                    style={{ borderColor: evt.color, backgroundColor: `${evt.color}20` }}
                  >
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: evt.color }} />
                  </div>

                  {/* Event card */}
                  <div
                    className="flex-1 p-4 bg-surface border border-border rounded-xl hover:border-accent-gold/30 transition group cursor-pointer"
                    onClick={() => openEdit(evt)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {evt.date && (
                            <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: `${evt.color}20`, color: evt.color }}>
                              {evt.date}
                            </span>
                          )}
                          <span className="text-[10px] text-text-dim uppercase tracking-wider">{evt.lane}</span>
                        </div>
                        <h4 className="font-serif font-bold text-text-primary group-hover:text-accent-gold transition">
                          {evt.title}
                        </h4>
                        {evt.description && (
                          <p className="text-sm text-text-muted mt-1 line-clamp-2">{evt.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button className="p-1 hover:bg-elevated rounded"><GripVertical size={14} className="text-text-dim" /></button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onDeleteEvent(evt.id); }}
                          className="p-1 hover:bg-danger/20 rounded"
                        >
                          <Trash2 size={14} className="text-danger" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Form Modal */}
      <Modal open={showForm} onClose={() => { setShowForm(false); setEditingEvent(null); }} title={editingEvent ? 'Edit Event' : 'New Event'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-text-muted mb-1.5">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Event name..."
              className="w-full px-4 py-2.5 bg-elevated border border-border rounded-lg text-text-primary outline-none focus:border-accent-gold transition"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-1.5">Date (fictional)</label>
            <input
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              placeholder="e.g. Year 342, Third Age..."
              className="w-full px-4 py-2.5 bg-elevated border border-border rounded-lg text-text-primary outline-none focus:border-accent-gold transition"
            />
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-1.5">Lane</label>
            <input
              value={form.lane}
              onChange={(e) => setForm({ ...form, lane: e.target.value })}
              placeholder="e.g. Main, Kingdom A, Character Arc..."
              className="w-full px-4 py-2.5 bg-elevated border border-border rounded-lg text-text-primary outline-none focus:border-accent-gold transition"
            />
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What happened..."
              rows={3}
              className="w-full px-4 py-2.5 bg-elevated border border-border rounded-lg text-text-primary outline-none focus:border-accent-gold transition resize-none"
            />
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-1.5">Color</label>
            <div className="flex gap-2">
              {LANE_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setForm({ ...form, color: c })}
                  className={`w-7 h-7 rounded-full transition-transform ${form.color === c ? 'scale-125 ring-2 ring-white/30' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} className="flex-1 py-2.5 bg-accent-gold text-deep font-semibold rounded-lg hover:bg-accent-amber transition">
              {editingEvent ? 'Save' : 'Create'}
            </button>
            <button onClick={() => { setShowForm(false); setEditingEvent(null); }} className="px-6 py-2.5 border border-border text-text-muted rounded-lg hover:bg-elevated transition">
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
