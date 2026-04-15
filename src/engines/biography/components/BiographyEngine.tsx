import { useState, useEffect, useMemo } from 'react';
import { BookUser, Plus, Trash2, X, ChevronRight } from 'lucide-react';
import type { EngineComponentProps } from '@/engines/_types';
import { useBiographies } from '../hooks';
import BiographyView from './BiographyView';
import { generateId } from '@/utils/idGenerator';

export default function BiographyEngine({ projectId }: EngineComponentProps) {
  const { biographies, addBiography, editBiography, removeBiography } = useBiographies(projectId);
  const [activeBiographyId, setActiveBiographyId] = useState<string>('');
  const [showNewBio, setShowNewBio] = useState(false);
  const [newBioName, setNewBioName] = useState('');

  // Auto-select first biography
  useEffect(() => {
    if (biographies.length > 0 && !activeBiographyId) {
      setActiveBiographyId(biographies[0].id);
    }
  }, [biographies, activeBiographyId]);

  // Ensure at least one biography exists
  useEffect(() => {
    if (biographies.length === 0) {
      const ensureBio = async () => {
        const bio = {
          id: generateId('bio'),
          projectId,
          subjectName: 'New Subject',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        await addBiography(bio);
        setActiveBiographyId(bio.id);
      };
      ensureBio();
    }
  }, [biographies.length, projectId, addBiography]);

  const activeBiography = useMemo(
    () => biographies.find(b => b.id === activeBiographyId),
    [biographies, activeBiographyId]
  );

  const loading = useMemo(() => biographies.length === 0, [biographies.length]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-accent-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main biography view */}
      {activeBiography && (
        <BiographyView
          biography={activeBiography}
          onUpdate={(changes) => editBiography(activeBiography.id, changes)}
        />
      )}

      {/* Biographies dashboard */}
      <div className="border border-border rounded-xl bg-surface/50 p-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <BookUser size={14} className="text-accent-gold" />
            Your Biographies
          </h3>
          {showNewBio ? (
            <div className="flex items-center gap-1">
              <input
                value={newBioName}
                onChange={(e) => setNewBioName(e.target.value)}
                placeholder="Subject name..."
                className="px-2.5 py-1 bg-elevated border border-border rounded-lg text-sm text-text-primary outline-none focus:border-accent-gold w-40"
                autoFocus
                onKeyDown={async (e) => {
                  if (e.key === 'Enter' && newBioName.trim()) {
                    const bio = {
                      id: generateId('bio'),
                      projectId,
                      subjectName: newBioName.trim(),
                      createdAt: Date.now(),
                      updatedAt: Date.now(),
                    };
                    await addBiography(bio);
                    setActiveBiographyId(bio.id);
                    setNewBioName('');
                    setShowNewBio(false);
                  }
                  if (e.key === 'Escape') {
                    setShowNewBio(false);
                    setNewBioName('');
                  }
                }}
              />
              <button
                onClick={async () => {
                  if (newBioName.trim()) {
                    const bio = {
                      id: generateId('bio'),
                      projectId,
                      subjectName: newBioName.trim(),
                      createdAt: Date.now(),
                      updatedAt: Date.now(),
                    };
                    await addBiography(bio);
                    setActiveBiographyId(bio.id);
                    setNewBioName('');
                    setShowNewBio(false);
                  }
                }}
                className="p-1.5 text-accent-gold hover:text-accent-amber transition"
              >
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() => {
                  setShowNewBio(false);
                  setNewBioName('');
                }}
                className="p-1.5 text-text-muted hover:text-text-primary transition"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowNewBio(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-accent-gold/10 text-accent-gold rounded-lg hover:bg-accent-gold/20 transition"
            >
              <Plus size={13} />
              New Biography
            </button>
          )}
        </div>

        {biographies.length === 0 ? (
          <p className="text-sm text-text-dim text-center py-4">No biographies yet. Create one to get started.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {biographies.map((bio) => {
              const isActive = bio.id === activeBiographyId;
              return (
                <div
                  key={bio.id}
                  className={`group relative rounded-lg border-2 transition cursor-pointer ${
                    isActive ? 'border-accent-gold bg-accent-gold/10' : 'border-border bg-elevated hover:border-accent-gold/40'
                  }`}
                >
                  {bio.subjectPhoto && (
                    <img
                      src={bio.subjectPhoto}
                      alt={bio.subjectName}
                      className="w-full h-20 object-cover rounded-t-[6px]"
                    />
                  )}
                  <button onClick={() => setActiveBiographyId(bio.id)} className="w-full text-left p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <BookUser size={12} className={isActive ? 'text-accent-gold' : 'text-text-dim'} />
                      <span
                        className={`text-sm font-serif font-semibold truncate ${isActive ? 'text-accent-gold' : 'text-text-primary'}`}
                      >
                        {bio.subjectName}
                      </span>
                    </div>
                    <p className="text-[10px] text-text-dim">{new Date(bio.createdAt).toLocaleDateString()}</p>
                  </button>

                  {/* Delete button */}
                  {biographies.length > 1 && (
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (confirm(`Delete biography of "${bio.subjectName}"? All facts will be lost.`)) {
                          await removeBiography(bio.id);
                          if (activeBiographyId === bio.id) {
                            const remaining = biographies.filter((b) => b.id !== bio.id);
                            if (remaining.length > 0) setActiveBiographyId(remaining[0].id);
                          }
                        }
                      }}
                      className="absolute top-1.5 right-1.5 p-1 rounded-full opacity-0 group-hover:opacity-100 text-text-dim hover:text-danger hover:bg-danger/10 transition"
                      title="Delete biography"
                    >
                      <Trash2 size={11} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
