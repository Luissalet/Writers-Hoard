import { useState, useRef } from 'react';
import type { CodexEntry, CodexEntryType } from '@/types';
import { getTemplateFields } from '@/types';
import { generateId } from '@/utils/idGenerator';
import TiptapEditor from '@/components/editor/TiptapEditor';
import TagInput from '@/components/common/TagInput';
import { User, MapPin, Sword, Shield, Sparkles, HelpCircle, BookOpen, ImagePlus, X } from 'lucide-react';

const typeConfig: Record<CodexEntryType, { icon: typeof User; label: string; color: string }> = {
  character: { icon: User, label: 'Character', color: '#c4973b' },
  location: { icon: MapPin, label: 'Location', color: '#4a9e6d' },
  item: { icon: Sword, label: 'Item', color: '#4a7ec4' },
  faction: { icon: Shield, label: 'Faction', color: '#c4463a' },
  concept: { icon: Sparkles, label: 'Concept', color: '#7c5cbf' },
  magic: { icon: Sparkles, label: 'Magic System', color: '#d4a843' },
  custom: { icon: HelpCircle, label: 'Custom', color: '#8a8690' },
};

const FIELD_LABELS: Record<string, string> = {
  name: 'Name',
  age: 'Age',
  species: 'Species / Race',
  role: 'Role in Story',
  physicalDescription: 'Physical Description',
  personality: 'Personality',
  backstory: 'Backstory',
  abilities: 'Abilities',
  goals: 'Goals & Motivations',
  flaws: 'Flaws & Weaknesses',
  region: 'Region',
  climate: 'Climate',
  population: 'Population',
  history: 'History',
  notableFeatures: 'Notable Features',
  inhabitants: 'Key Inhabitants',
  type: 'Type',
  origin: 'Origin',
  properties: 'Properties',
  currentOwner: 'Current Owner',
  leader: 'Leader',
  territory: 'Territory',
  allies: 'Allies',
  enemies: 'Enemies',
};

interface CodexEntryFormProps {
  projectId: string;
  entry?: CodexEntry;
  onSave: (entry: CodexEntry) => void;
  onCancel: () => void;
}

export default function CodexEntryForm({ projectId, entry, onSave, onCancel }: CodexEntryFormProps) {
  const [type, setType] = useState<CodexEntryType>(entry?.type || 'character');
  const [title, setTitle] = useState(entry?.title || '');
  const [avatar, setAvatar] = useState(entry?.avatar || '');
  const [fields, setFields] = useState<Record<string, string>>(entry?.fields || getTemplateFields(type));
  const [content, setContent] = useState(entry?.content || '');
  const [tags, setTags] = useState<string[]>(entry?.tags || []);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatar(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleTypeChange = (newType: CodexEntryType) => {
    setType(newType);
    if (!entry) {
      setFields(getTemplateFields(newType));
    }
  };

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      id: entry?.id || generateId('codex'),
      projectId,
      type,
      title,
      avatar: avatar || undefined,
      fields,
      content,
      tags,
      relations: entry?.relations || [],
      createdAt: entry?.createdAt || Date.now(),
      updatedAt: Date.now(),
    });
  };

  return (
    <div className="space-y-6">
      {/* Type selector */}
      {!entry && (
        <div>
          <label className="block text-sm text-text-muted mb-2">Entry Type</label>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(typeConfig) as CodexEntryType[]).map(t => {
              const config = typeConfig[t];
              const Icon = config.icon;
              return (
                <button
                  key={t}
                  onClick={() => handleTypeChange(t)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                    type === t
                      ? 'border-2'
                      : 'border border-border text-text-muted hover:text-text-primary hover:bg-elevated'
                  }`}
                  style={type === t ? { borderColor: config.color, color: config.color, backgroundColor: `${config.color}15` } : {}}
                >
                  <Icon size={16} />
                  {config.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Title + Avatar */}
      <div className="flex gap-4 items-start">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <label className="block text-sm text-text-muted mb-1.5">Avatar</label>
          <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          {avatar ? (
            <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-border group">
              <img src={avatar} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1">
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  className="p-1.5 bg-white/20 rounded-full hover:bg-white/30 transition"
                  title="Change"
                >
                  <ImagePlus size={12} className="text-white" />
                </button>
                <button
                  onClick={() => setAvatar('')}
                  className="p-1.5 bg-white/20 rounded-full hover:bg-red-500/50 transition"
                  title="Remove"
                >
                  <X size={12} className="text-white" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-text-muted hover:border-accent-gold/50 hover:text-accent-gold transition"
            >
              <ImagePlus size={20} />
              <span className="text-[10px]">Image</span>
            </button>
          )}
        </div>

        {/* Title */}
        <div className="flex-1">
          <label className="block text-sm text-text-muted mb-1.5">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Entry name..."
            className="w-full px-4 py-2.5 bg-elevated border border-border rounded-lg text-text-primary outline-none focus:border-accent-gold transition text-lg font-serif"
          />
        </div>
      </div>

      {/* Template fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(fields).map(([key, value]) => (
          <div key={key}>
            <label className="block text-sm text-text-muted mb-1.5">
              {FIELD_LABELS[key] || key}
            </label>
            {key === 'backstory' || key === 'history' || key === 'physicalDescription' || key === 'personality' ? (
              <textarea
                value={value}
                onChange={(e) => setFields({ ...fields, [key]: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 bg-elevated border border-border rounded-lg text-text-primary outline-none focus:border-accent-gold transition resize-none text-sm"
              />
            ) : (
              <input
                value={value}
                onChange={(e) => setFields({ ...fields, [key]: e.target.value })}
                className="w-full px-3 py-2 bg-elevated border border-border rounded-lg text-text-primary outline-none focus:border-accent-gold transition text-sm"
              />
            )}
          </div>
        ))}
      </div>

      {/* Rich text content */}
      <div>
        <label className="flex items-center gap-2 text-sm text-text-muted mb-1.5">
          <BookOpen size={14} />
          Extended Notes
        </label>
        <TiptapEditor content={content} onChange={setContent} placeholder="Write detailed notes, lore, story connections..." />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm text-text-muted mb-1.5">Tags</label>
        <TagInput tags={tags} onChange={setTags} />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={handleSave}
          className="flex-1 py-2.5 bg-accent-gold text-deep font-semibold rounded-lg hover:bg-accent-amber transition"
        >
          {entry ? 'Save Changes' : 'Create Entry'}
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-2.5 border border-border text-text-muted rounded-lg hover:bg-elevated transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
