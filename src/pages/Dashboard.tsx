import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Feather, Upload, Download, Database } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import ProjectCard from '@/components/bubbles/ProjectCard';
import Modal from '@/components/common/Modal';
import EmptyState from '@/components/common/EmptyState';
import TopBar from '@/components/layout/TopBar';
import { generateId } from '@/utils/idGenerator';
import { importProjectData, importFullDatabase } from '@/db/operations';
import { exportFullZip, importFullZip } from '@/services/zipBackup';
import type { Project } from '@/types';

const PROJECT_COLORS = ['#c4973b', '#7c5cbf', '#4a7ec4', '#4a9e6d', '#c4463a', '#d4a843', '#9b7ed8', '#e4a853'];

export default function Dashboard() {
  const { projects, loading, addProject, removeProject, refresh } = useProjects();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [importing, setImporting] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);
  const fullImportRef = useRef<HTMLInputElement>(null);
  const [exporting, setExporting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    type: 'standalone' as Project['type'],
    description: '',
    color: PROJECT_COLORS[0],
  });

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const newId = await importProjectData(data);
      await refresh();
      navigate(`/project/${newId}`);
    } catch (err) {
      console.error('Import failed:', err);
      alert('Error importing project. Make sure the file is a valid export.');
    } finally {
      setImporting(false);
      if (importRef.current) importRef.current.value = '';
    }
  };

  const handleFullExport = async () => {
    setExporting(true);
    try {
      await exportFullZip();
    } catch (err) {
      console.error('Full export failed:', err);
      alert('Error exporting database.');
    } finally {
      setExporting(false);
    }
  };

  const handleFullImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!confirm('Esto REEMPLAZARÁ todos tus datos actuales con el backup importado. ¿Estás seguro?')) {
      if (fullImportRef.current) fullImportRef.current.value = '';
      return;
    }
    setImporting(true);
    try {
      if (file.name.endsWith('.zip')) {
        // Structured ZIP backup
        await importFullZip(file);
        await refresh();
        window.location.reload();
      } else if (file.name.endsWith('.json')) {
        // Legacy JSON backup
        const text = await file.text();
        const data = JSON.parse(text);
        if (data.fullExport) {
          await importFullDatabase(data);
          await refresh();
          window.location.reload();
        } else {
          const newId = await importProjectData(data);
          await refresh();
          navigate(`/project/${newId}`);
        }
      } else {
        alert('Formato no soportado. Usa un archivo .zip o .json');
      }
    } catch (err) {
      console.error('Full import failed:', err);
      alert('Error importing backup. Make sure the file is a valid export.');
    } finally {
      setImporting(false);
      if (fullImportRef.current) fullImportRef.current.value = '';
    }
  };

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
          <div className="flex items-center gap-3">
            <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
            <input ref={fullImportRef} type="file" accept=".zip,.json" className="hidden" onChange={handleFullImport} />

            {/* Full backup controls */}
            <button
              onClick={handleFullExport}
              disabled={exporting}
              className="flex items-center gap-2 px-3 py-2.5 border border-accent-plum/30 text-accent-plum-light rounded-xl hover:bg-accent-plum/10 transition text-sm"
              title="Export entire database (all projects) as a backup"
            >
              <Database size={14} />
              <Download size={14} />
              {exporting ? 'Exporting...' : 'Full Backup'}
            </button>
            <button
              onClick={() => fullImportRef.current?.click()}
              disabled={importing}
              className="flex items-center gap-2 px-3 py-2.5 border border-accent-plum/30 text-accent-plum-light rounded-xl hover:bg-accent-plum/10 transition text-sm"
              title="Restore from a full backup (replaces all data)"
            >
              <Database size={14} />
              <Upload size={14} />
              {importing ? 'Restoring...' : 'Restore Backup'}
            </button>

            <div className="w-px h-8 bg-border" />

            <button
              onClick={() => importRef.current?.click()}
              disabled={importing}
              className="flex items-center gap-2 px-4 py-2.5 border border-border text-text-muted rounded-xl hover:text-text-primary hover:bg-elevated transition"
            >
              <Upload size={16} />
              {importing ? 'Importing...' : 'Import Project'}
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-accent-gold text-deep font-semibold rounded-xl hover:bg-accent-amber transition shadow-lg shadow-accent-gold/20"
            >
              <Plus size={18} />
              New Project
            </button>
          </div>
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
