import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { BookOpen, Clock, Map, Network, Image, Link2, Download, PenLine } from 'lucide-react';
import { useProject } from '@/hooks/useProjects';
import { useCodexEntries } from '@/hooks/useCodexEntries';
import { useTimelines, useTimelineEvents } from '@/hooks/useTimelineEvents';
import { useYarnBoards, useYarnBoardData } from '@/hooks/useYarnBoard';
import { useWorldMaps, useMapPins } from '@/hooks/useMaps';
import { useInspirationImages } from '@/hooks/useGallery';
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
  const { timelines, addTimeline } = useTimelines(id || '');
  const [activeTimelineId, setActiveTimelineId] = useState<string>('');
  const { events, addEvent, editEvent, removeEvent } = useTimelineEvents(activeTimelineId);

  const { boards, addBoard } = useYarnBoards(id || '');
  const [activeBoardId, setActiveBoardId] = useState<string>('');
  const { nodes, edges, addNode, addEdge, removeNode, removeEdge } = useYarnBoardData(activeBoardId);

  const { maps, addMap, editMap } = useWorldMaps(id || '');
  const [activeMapId, setActiveMapId] = useState<string>('');
  const { pins, addPin, removePin } = useMapPins(activeMapId);

  const { images, addImage, removeImage } = useInspirationImages(id || '');
  const { links, addLink, removeLink } = useExternalLinks(id || '');
  const { writings, addWriting, editWriting, removeWriting } = useWritings(id || '');

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

          {activeTab === 'timeline' && activeTimelineId && (
            <TimelineView
              projectId={id!}
              timelineId={activeTimelineId}
              events={events}
              onAddEvent={addEvent}
              onEditEvent={editEvent}
              onDeleteEvent={removeEvent}
            />
          )}

          {activeTab === 'yarn' && activeBoardId && (
            <YarnBoard
              projectId={id!}
              boardId={activeBoardId}
              initialNodes={nodes}
              initialEdges={edges}
              onSaveNode={addNode}
              onSaveEdge={addEdge}
              onDeleteNode={removeNode}
              onDeleteEdge={removeEdge}
            />
          )}

          {activeTab === 'maps' && activeMapId && (
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

          {activeTab === 'gallery' && (
            <InspirationGallery
              projectId={id!}
              images={images}
              onAdd={addImage}
              onDelete={removeImage}
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
