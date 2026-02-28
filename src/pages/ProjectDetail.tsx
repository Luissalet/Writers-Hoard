import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { BookOpen, Clock, Map, Network, Image, Link2, Download, PenLine, Plus, Trash2, X, ChevronRight } from 'lucide-react';
import { useProject } from '@/hooks/useProjects';
import { useCodexEntries } from '@/hooks/useCodexEntries';
import { useTimelines, useTimelineEvents } from '@/hooks/useTimelineEvents';
import { useYarnBoards, useYarnBoardData } from '@/hooks/useYarnBoard';
import { useWorldMaps, useMapPins } from '@/hooks/useMaps';
import { useInspirationImages, useImageCollections } from '@/hooks/useGallery';
import { useExternalLinks } from '@/hooks/useExternalLinks';
import { useWritings } from '@/hooks/useWritings';
import CodexEntryList from '@/components/codex/CodexEntryList';
import TimelineView from '@/components/timeline/TimelineView';
import YarnBoard from '@/components/yarn/YarnBoard';
import MapView from '@/components/maps/MapView';
import InspirationGallery from '@/components/gallery/InspirationGallery';
import ExternalLinksView from '@/components/links/ExternalLinksView';
import WritingsView from '@/components/writings/WritingsView';
import TopBar from '@/components/layout/TopBar';
import { generateId } from '@/utils/idGenerator';
import { exportProjectData } from '@/db/operations';

type TabId = 'overview' | 'writings' | 'codex' | 'timeline' | 'maps' | 'yarn' | 'gallery' | 'links';

const tabs: { id: TabId; label: string; icon: typeof BookOpen }[] = [
  { id: 'writings', label: 'Writings', icon: PenLine },
  { id: 'codex', label: 'Codex', icon: BookOpen },
  { id: 'timeline', label: 'Timeline', icon: Clock },
  { id: 'maps', label: 'Maps', icon: Map },
  { id: 'yarn', label: 'Yarn Board', icon: Network },
  { id: 'gallery', label: 'Gallery', icon: Image },
  { id: 'links', label: 'Links', icon: Link2 },
];

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { project, loading } = useProject(id);
  const [activeTab, setActiveTab] = useState<TabId>('writings');

  // Data hooks
  const { entries, addEntry, editEntry, removeEntry } = useCodexEntries(id || '');
  const { timelines, addTimeline, removeTimeline } = useTimelines(id || '');
  const [activeTimelineId, setActiveTimelineId] = useState<string>('');
  const [showNewTimeline, setShowNewTimeline] = useState(false);
  const [newTimelineName, setNewTimelineName] = useState('');
  const { events, addEvent, editEvent, removeEvent } = useTimelineEvents(activeTimelineId);

  const { boards, addBoard, removeBoard } = useYarnBoards(id || '');
  const [activeBoardId, setActiveBoardId] = useState<string>('');
  const [showNewBoard, setShowNewBoard] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const { nodes, edges, addNode, updateNode, addEdge, updateEdge, removeNode, removeEdge } = useYarnBoardData(activeBoardId);

  const { maps, addMap, editMap, removeMap } = useWorldMaps(id || '');
  const [activeMapId, setActiveMapId] = useState<string>('');
  const [showNewMap, setShowNewMap] = useState(false);
  const [newMapName, setNewMapName] = useState('');
  const { pins, addPin, removePin } = useMapPins(activeMapId);

  const { images, addImage, editImage, removeImage } = useInspirationImages(id || '');
  const { collections, addCollection, removeCollection } = useImageCollections(id || '');
  const { links, addLink, removeLink } = useExternalLinks(id || '');
  const { writings, addWriting, editWriting, removeWriting, refresh: refreshWritings } = useWritings(id || '');

  // Auto-create default timeline/board/map if none exist
  useEffect(() => {
    if (timelines.length > 0 && !activeTimelineId) {
      setActiveTimelineId(timelines[0].id);
    }
  }, [timelines, activeTimelineId]);

  useEffect(() => {
    if (boards.length > 0 && !activeBoardId) {
      setActiveBoardId(boards[0].id);
    }
  }, [boards, activeBoardId]);

  useEffect(() => {
    if (maps.length > 0 && !activeMapId) {
      setActiveMapId(maps[0].id);
    }
  }, [maps, activeMapId]);

  const ensureTimeline = async () => {
    if (timelines.length === 0 && id) {
      const tl = { id: generateId('tl'), projectId: id, title: 'Main Timeline', createdAt: Date.now(), updatedAt: Date.now() };
      await addTimeline(tl);
      setActiveTimelineId(tl.id);
    }
  };

  const ensureBoard = async () => {
    if (boards.length === 0 && id) {
      const board = { id: generateId('board'), projectId: id, title: 'Main Board', createdAt: Date.now(), updatedAt: Date.now() };
      await addBoard(board);
      setActiveBoardId(board.id);
    }
  };

  const ensureMap = async () => {
    if (maps.length === 0 && id) {
      const map = { id: generateId('map'), projectId: id, title: 'World Map', createdAt: Date.now(), updatedAt: Date.now() };
      await addMap(map);
      setActiveMapId(map.id);
    }
  };

  useEffect(() => {
    if (activeTab === 'timeline') ensureTimeline();
    if (activeTab === 'yarn') ensureBoard();
    if (activeTab === 'maps') ensureMap();
  }, [activeTab]);

  const handleExport = async () => {
    if (!id) return;
    const data = await exportProjectData(id);
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project?.title || 'project'}-export.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-text-muted">Project not found</p>
      </div>
    );
  }

  return (
    <>
      <TopBar title={project.title} subtitle={`${project.type} · ${project.status}`} />

      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Tab bar */}
        <div className="flex items-center gap-1 px-6 py-2 border-b border-border bg-surface/50 overflow-x-auto flex-shrink-0">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? 'bg-accent-gold/15 text-accent-gold font-semibold'
                    : 'text-text-muted hover:text-text-primary hover:bg-elevated'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
          <div className="flex-1" />
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-text-muted hover:text-text-primary transition"
            title="Export project"
          >
            <Download size={14} /> Export
          </button>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'writings' && (
            <WritingsView
              projectId={id!}
              writings={writings}
              onAdd={addWriting}
              onEdit={editWriting}
              onDelete={removeWriting}
              onRefresh={refreshWritings}
            />
          )}

          {activeTab === 'codex' && (
            <CodexEntryList
              projectId={id!}
              entries={entries}
              onAdd={addEntry}
              onEdit={editEntry}
              onDelete={removeEntry}
            />
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-4">
              {activeTimelineId && (
                <TimelineView
                  projectId={id!}
                  timelineId={activeTimelineId}
                  events={events}
                  onAddEvent={addEvent}
                  onEditEvent={editEvent}
                  onDeleteEvent={removeEvent}
                />
              )}

              {/* Timelines dashboard */}
              <div className="border border-border rounded-xl bg-surface/50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                    <Clock size={14} className="text-accent-gold" />
                    Your Timelines
                  </h3>
                  {showNewTimeline ? (
                    <div className="flex items-center gap-1">
                      <input
                        value={newTimelineName}
                        onChange={(e) => setNewTimelineName(e.target.value)}
                        placeholder="Timeline name..."
                        className="px-2.5 py-1 bg-elevated border border-border rounded-lg text-sm text-text-primary outline-none focus:border-accent-gold w-40"
                        autoFocus
                        onKeyDown={async (e) => {
                          if (e.key === 'Enter' && newTimelineName.trim() && id) {
                            const tl = { id: generateId('tl'), projectId: id, title: newTimelineName.trim(), createdAt: Date.now(), updatedAt: Date.now() };
                            await addTimeline(tl);
                            setActiveTimelineId(tl.id);
                            setNewTimelineName('');
                            setShowNewTimeline(false);
                          }
                          if (e.key === 'Escape') { setShowNewTimeline(false); setNewTimelineName(''); }
                        }}
                      />
                      <button
                        onClick={async () => {
                          if (newTimelineName.trim() && id) {
                            const tl = { id: generateId('tl'), projectId: id, title: newTimelineName.trim(), createdAt: Date.now(), updatedAt: Date.now() };
                            await addTimeline(tl);
                            setActiveTimelineId(tl.id);
                            setNewTimelineName('');
                            setShowNewTimeline(false);
                          }
                        }}
                        className="p-1.5 text-accent-gold hover:text-accent-amber transition"
                      >
                        <ChevronRight size={16} />
                      </button>
                      <button onClick={() => { setShowNewTimeline(false); setNewTimelineName(''); }} className="p-1.5 text-text-muted hover:text-text-primary transition">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowNewTimeline(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-accent-gold/10 text-accent-gold rounded-lg hover:bg-accent-gold/20 transition"
                    >
                      <Plus size={13} />
                      New Timeline
                    </button>
                  )}
                </div>

                {timelines.length === 0 ? (
                  <p className="text-sm text-text-dim text-center py-4">No timelines yet. Create one to get started.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                    {timelines.map(tl => {
                      const isActive = tl.id === activeTimelineId;
                      return (
                        <div
                          key={tl.id}
                          className={`group relative rounded-lg border-2 transition cursor-pointer ${
                            isActive
                              ? 'border-accent-gold bg-accent-gold/10'
                              : 'border-border bg-elevated hover:border-accent-gold/40'
                          }`}
                        >
                          <button
                            onClick={() => setActiveTimelineId(tl.id)}
                            className="w-full text-left p-3"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Clock size={12} className={isActive ? 'text-accent-gold' : 'text-text-dim'} />
                              <span className={`text-sm font-serif font-semibold truncate ${isActive ? 'text-accent-gold' : 'text-text-primary'}`}>
                                {tl.title}
                              </span>
                            </div>
                            <p className="text-[10px] text-text-dim">
                              {new Date(tl.createdAt).toLocaleDateString()}
                            </p>
                          </button>
                          {timelines.length > 1 && (
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (confirm(`Delete timeline "${tl.title}"? All its events will be lost.`)) {
                                  await removeTimeline(tl.id);
                                  if (activeTimelineId === tl.id) {
                                    const remaining = timelines.filter(t => t.id !== tl.id);
                                    if (remaining.length > 0) setActiveTimelineId(remaining[0].id);
                                  }
                                }
                              }}
                              className="absolute top-1.5 right-1.5 p-1 rounded-full opacity-0 group-hover:opacity-100 text-text-dim hover:text-danger hover:bg-danger/10 transition"
                              title="Delete timeline"
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
          )}

          {activeTab === 'yarn' && (
            <div className="space-y-4">
              {/* Board canvas */}
              {activeBoardId && (
                <YarnBoard
                  projectId={id!}
                  boardId={activeBoardId}
                  initialNodes={nodes}
                  initialEdges={edges}
                  onSaveNode={addNode}
                  onUpdateNode={updateNode}
                  onSaveEdge={addEdge}
                  onUpdateEdge={updateEdge}
                  onDeleteNode={removeNode}
                  onDeleteEdge={removeEdge}
                />
              )}

              {/* Boards dashboard */}
              <div className="border border-border rounded-xl bg-surface/50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                    <Network size={14} className="text-accent-gold" />
                    Your Boards
                  </h3>
                  {showNewBoard ? (
                    <div className="flex items-center gap-1">
                      <input
                        value={newBoardName}
                        onChange={(e) => setNewBoardName(e.target.value)}
                        placeholder="Board name..."
                        className="px-2.5 py-1 bg-elevated border border-border rounded-lg text-sm text-text-primary outline-none focus:border-accent-gold w-40"
                        autoFocus
                        onKeyDown={async (e) => {
                          if (e.key === 'Enter' && newBoardName.trim() && id) {
                            const board = { id: generateId('board'), projectId: id, title: newBoardName.trim(), createdAt: Date.now(), updatedAt: Date.now() };
                            await addBoard(board);
                            setActiveBoardId(board.id);
                            setNewBoardName('');
                            setShowNewBoard(false);
                          }
                          if (e.key === 'Escape') { setShowNewBoard(false); setNewBoardName(''); }
                        }}
                      />
                      <button
                        onClick={async () => {
                          if (newBoardName.trim() && id) {
                            const board = { id: generateId('board'), projectId: id, title: newBoardName.trim(), createdAt: Date.now(), updatedAt: Date.now() };
                            await addBoard(board);
                            setActiveBoardId(board.id);
                            setNewBoardName('');
                            setShowNewBoard(false);
                          }
                        }}
                        className="p-1.5 text-accent-gold hover:text-accent-amber transition"
                      >
                        <ChevronRight size={16} />
                      </button>
                      <button onClick={() => { setShowNewBoard(false); setNewBoardName(''); }} className="p-1.5 text-text-muted hover:text-text-primary transition">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowNewBoard(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-accent-gold/10 text-accent-gold rounded-lg hover:bg-accent-gold/20 transition"
                    >
                      <Plus size={13} />
                      New Board
                    </button>
                  )}
                </div>

                {boards.length === 0 ? (
                  <p className="text-sm text-text-dim text-center py-4">No boards yet. Create one to get started.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                    {boards.map(board => {
                      const isActive = board.id === activeBoardId;
                      return (
                        <div
                          key={board.id}
                          className={`group relative rounded-lg border-2 transition cursor-pointer ${
                            isActive
                              ? 'border-accent-gold bg-accent-gold/10'
                              : 'border-border bg-elevated hover:border-accent-gold/40'
                          }`}
                        >
                          <button
                            onClick={() => setActiveBoardId(board.id)}
                            className="w-full text-left p-3"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Network size={12} className={isActive ? 'text-accent-gold' : 'text-text-dim'} />
                              <span className={`text-sm font-serif font-semibold truncate ${isActive ? 'text-accent-gold' : 'text-text-primary'}`}>
                                {board.title}
                              </span>
                            </div>
                            <p className="text-[10px] text-text-dim">
                              {new Date(board.createdAt).toLocaleDateString()}
                            </p>
                          </button>

                          {/* Delete button */}
                          {boards.length > 1 && (
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (confirm(`Delete board "${board.title}"? All its nodes and connections will be lost.`)) {
                                  await removeBoard(board.id);
                                  if (activeBoardId === board.id) {
                                    const remaining = boards.filter(b => b.id !== board.id);
                                    if (remaining.length > 0) setActiveBoardId(remaining[0].id);
                                  }
                                }
                              }}
                              className="absolute top-1.5 right-1.5 p-1 rounded-full opacity-0 group-hover:opacity-100 text-text-dim hover:text-danger hover:bg-danger/10 transition"
                              title="Delete board"
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
          )}

          {activeTab === 'maps' && (
            <div className="space-y-4">
              {activeMapId && (
                <MapView
                  projectId={id!}
                  mapId={activeMapId}
                  backgroundImage={maps.find(m => m.id === activeMapId)?.backgroundImage}
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
                          if (e.key === 'Enter' && newMapName.trim() && id) {
                            const map = { id: generateId('map'), projectId: id, title: newMapName.trim(), createdAt: Date.now(), updatedAt: Date.now() };
                            await addMap(map);
                            setActiveMapId(map.id);
                            setNewMapName('');
                            setShowNewMap(false);
                          }
                          if (e.key === 'Escape') { setShowNewMap(false); setNewMapName(''); }
                        }}
                      />
                      <button
                        onClick={async () => {
                          if (newMapName.trim() && id) {
                            const map = { id: generateId('map'), projectId: id, title: newMapName.trim(), createdAt: Date.now(), updatedAt: Date.now() };
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
                      <button onClick={() => { setShowNewMap(false); setNewMapName(''); }} className="p-1.5 text-text-muted hover:text-text-primary transition">
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
                    {maps.map(m => {
                      const isActive = m.id === activeMapId;
                      return (
                        <div
                          key={m.id}
                          className={`group relative rounded-lg border-2 transition cursor-pointer ${
                            isActive
                              ? 'border-accent-gold bg-accent-gold/10'
                              : 'border-border bg-elevated hover:border-accent-gold/40'
                          }`}
                        >
                          <button
                            onClick={() => setActiveMapId(m.id)}
                            className="w-full text-left p-3"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Map size={12} className={isActive ? 'text-accent-gold' : 'text-text-dim'} />
                              <span className={`text-sm font-serif font-semibold truncate ${isActive ? 'text-accent-gold' : 'text-text-primary'}`}>
                                {m.title}
                              </span>
                            </div>
                            <p className="text-[10px] text-text-dim">
                              {new Date(m.createdAt).toLocaleDateString()}
                            </p>
                          </button>
                          {maps.length > 1 && (
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (confirm(`Delete map "${m.title}"? All its pins will be lost.`)) {
                                  await removeMap(m.id);
                                  if (activeMapId === m.id) {
                                    const remaining = maps.filter(mp => mp.id !== m.id);
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
          )}

          {activeTab === 'gallery' && (
            <InspirationGallery
              projectId={id!}
              images={images}
              collections={collections}
              onAdd={addImage}
              onEditImage={editImage}
              onDelete={removeImage}
              onAddCollection={addCollection}
              onDeleteCollection={removeCollection}
            />
          )}

          {activeTab === 'links' && (
            <ExternalLinksView
              projectId={id!}
              links={links}
              onAdd={addLink}
              onDelete={removeLink}
            />
          )}
        </div>
      </div>
    </>
  );
}
