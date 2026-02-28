import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Feather } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import ProjectCard from '@/components/bubbles/ProjectCard';
import Modal from '@/components/common/Modal';
import EmptyState from '@/components/common/EmptyState';
import TopBar from '@/components/layout/TopBar';
import { generateId } from '@/utils/idGenerator';
import type { Project } from '@/types';

const PROJECT_COLORS = ['#c4973b', '#7c5cbf', '#4a7ec4', '#4a9e6d', '#c4463a', '#d4a843', '#9b7ed8', '#e4a853'];

export default function Dashboard() {
  const { projects, loading, addProject, removeProject } = useProjects();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: '',
    type: 'standalone' as Project['type'],
    description: '',
    color: PROJECT_COLORS[0],
  });

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    const project: Project = {
      id: generateId('proj'),
      title: form.title,
      type: form.type,
      color: form.color,
      description: form.description,
      status: 'draft',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await addProject(project);
    setShowCreate(false);
    setForm({ title: '', type: 'standalone', description: '', color: PROJECT_COLORS[0] });
    navigate(`/project/${project.id}`);
  };

  return (
    <>
      <TopBar title="Writer's Hoard" subtitle="Your creative universe" />
      <div className="flex-1 overflow-y-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-accent-gold">Projects</h1>
            <p className="text-text-muted mt-1">
              {projects.length} {projects.length === 1 ? 'world' : 'worlds'} in your hoard
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-accent-gold text-deep font-semibold rounded-xl hover:bg-accent-amber transition shadow-lg shadow-accent-gold/20"
          >
            <Plus size={18} />
            New Project
          </button>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-accent-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            icon={<Feather size={48} />}
            title="Your hoard awaits"
            message="Create your first project to start building worlds, characters, and stories."
            action={{ label: 'Create Project', onClick: () => setShowCreate(true) }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {projects.map((project, i) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={i}
                onClick={() => navigate(`/project/${project.id}`)}
                onDelete={() => removeProject(project.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Project">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-text-muted mb-1.5">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="The name of your world..."
              className="w-full px-4 py-2.5 bg-elevated border border-border rounded-lg text-text-primary outline-none focus:border-accent-gold transition"
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
            />
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-1.5">Type</label>
            <div className="grid grid-cols-2 gap-2">
              {(['saga', 'standalone', 'collection', 'idea'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setForm({ ...form, type })}
                  className={`px-3 py-2 rounded-lg text-sm capitalize transition ${
                    form.type === type
                      ? 'bg-accent-gold/20 text-accent-gold border border-accent-gold/40'
                      : 'bg-elevated border border-border text-text-muted hover:text-text-primary'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="A brief description..."
              rows={3}
              className="w-full px-4 py-2.5 bg-elevated border border-border rounded-lg text-text-primary outline-none focus:border-accent-gold transition resize-none"
            />
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-1.5">Color</label>
            <div className="flex gap-2">
              {PROJECT_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setForm({ ...form, color })}
                  className={`w-8 h-8 rounded-full transition-transform ${
                    form.color === color ? 'scale-125 ring-2 ring-white/30' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleCreate}
              className="flex-1 py-2.5 bg-accent-gold text-deep font-semibold rounded-lg hover:bg-accent-amber transition"
            >
              Create
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="px-6 py-2.5 border border-border text-text-muted rounded-lg hover:bg-elevated transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
