import { useState, useEffect, useMemo } from 'react';
import { Map, Plus, Trash2, X, ChevronRight } from 'lucide-react';
import type { EngineComponentProps } from '@/engines/_types';
import { useWorldMaps, useMapPins } from '@/hooks/useMaps';
import MapView from '@/components/maps/MapView';
import { generateId } from '@/utils/idGenerator';

export default function MapsEngine({ projectId }: EngineComponentProps) {
  const { maps, addMap, editMap, removeMap } = useWorldMaps(projectId);
  const [activeMapId, setActiveMapId] = useState<string>('');
  const [showNewMap, setShowNewMap] = useState(false);
  const [newMapName, setNewMapName] = useState('');
  const { pins, addPin, removePin } = useMapPins(activeMapId);

  // Auto-select first map
  useEffect(() => {
    if (maps.length > 0 && !activeMapId) {
      setActiveMapId(maps[0].id);
    }
  }, [maps, activeMapId]);

  // Ensure at least one map exists
  useEffect(() => {
    if (maps.length === 0) {
      const ensureMap = async () => {
        const map = {
          id: generateId('map'),
          projectId,
          title: 'World Map',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        await addMap(map);
        setActiveMapId(map.id);
      };
      ensureMap();
    }
  }, [maps.length, projectId, addMap]);

  const loading = useMemo(() => maps.length === 0, [maps.length]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-accent-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Map canvas */}
      {activeMapId && (
        <MapView
          projectId={projectId}
          mapId={activeMapId}
          backgroundImage={maps.find((m) => m.id === activeMapId)?.backgroundImage}
          pins={pins}
          onUploadBackground={(img) => editMap(activeMapId, { backgroundImage: img })}
          onAddPin={addPin}
          onDeletePin={removePin}
        />
      )}

      {/* Maps dashboard */}
      <div className="border border-border rounded-xl bg-surface/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <Map size={14} className="text-accent-gold" />
            Your Maps
          </h3>
          {showNewMap ? (
            <div className="flex items-center gap-1">
              <input
                value={newMapName}
                onChange={(e) => setNewMapName(e.target.value)}
                placeholder="Map name..."
                className="px-2.5 py-1 bg-elevated border border-border rounded-lg text-sm text-text-primary outline-none focus:border-accent-gold w-40"
                autoFocus
                onKeyDown={async (e) => {
                  if (e.key === 'Enter' && newMapName.trim()) {
                    const map = {
                      id: generateId('map'),
                      projectId,
                      title: newMapName.trim(),
                      createdAt: Date.now(),
                      updatedAt: Date.now(),
                    };
                    await addMap(map);
                    setActiveMapId(map.id);
                    setNewMapName('');
                    setShowNewMap(false);
                  }
                  if (e.key === 'Escape') {
                    setShowNewMap(false);
                    setNewMapName('');
                  }
                }}
              />
              <button
                onClick={async () => {
                  if (newMapName.trim()) {
                    const map = {
                      id: generateId('map'),
                      projectId,
                      title: newMapName.trim(),
                      createdAt: Date.now(),
                      updatedAt: Date.now(),
                    };
                    await addMap(map);
                    setActiveMapId(map.id);
                    setNewMapName('');
                    setShowNewMap(false);
                  }
                }}
                className="p-1.5 text-accent-gold hover:text-accent-amber transition"
              >
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() => {
                  setShowNewMap(false);
                  setNewMapName('');
                }}
                className="p-1.5 text-text-muted hover:text-text-primary transition"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowNewMap(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-accent-gold/10 text-accent-gold rounded-lg hover:bg-accent-gold/20 transition"
            >
              <Plus size={13} />
              New Map
            </button>
          )}
        </div>

        {maps.length === 0 ? (
          <p className="text-sm text-text-dim text-center py-4">No maps yet. Create one to get started.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {maps.map((m) => {
              const isActive = m.id === activeMapId;
              return (
                <div
                  key={m.id}
                  className={`group relative rounded-lg border-2 transition cursor-pointer ${
                    isActive ? 'border-accent-gold bg-accent-gold/10' : 'border-border bg-elevated hover:border-accent-gold/40'
                  }`}
                >
                  <button onClick={() => setActiveMapId(m.id)} className="w-full text-left p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Map size={12} className={isActive ? 'text-accent-gold' : 'text-text-dim'} />
                      <span
                        className={`text-sm font-serif font-semibold truncate ${isActive ? 'text-accent-gold' : 'text-text-primary'}`}
                      >
                        {m.title}
                      </span>
                    </div>
                    <p className="text-[10px] text-text-dim">{new Date(m.createdAt).toLocaleDateString()}</p>
                  </button>
                  {maps.length > 1 && (
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (confirm(`Delete map "${m.title}"? All its pins will be lost.`)) {
                          await removeMap(m.id);
                          if (activeMapId === m.id) {
                            const remaining = maps.filter((mp) => mp.id !== m.id);
                            if (remaining.length > 0) setActiveMapId(remaining[0].id);
                          }
                        }
                      }}
                      className="absolute top-1.5 right-1.5 p-1 rounded-full opacity-0 group-hover:opacity-100 text-text-dim hover:text-danger hover:bg-danger/10 transition"
                      title="Delete map"
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
