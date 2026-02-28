import { useCallback, useState } from 'react';
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Node,
  type Edge,
  BackgroundVariant,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Plus, Download, User, Zap, Lightbulb, StickyNote } from 'lucide-react';
import { toPng } from 'html-to-image';
import { generateId } from '@/utils/idGenerator';
import type { YarnNode, YarnEdge } from '@/types';

const YARN_COLORS = {
  red: { color: '#c4463a', label: 'Conflict' },
  green: { color: '#4a9e6d', label: 'Alliance' },
  blue: { color: '#4a7ec4', label: 'Romance' },
  yellow: { color: '#d4a843', label: 'Mystery' },
  plum: { color: '#7c5cbf', label: 'Other' },
};

const NODE_TYPES = {
  character: { icon: User, label: 'Character', color: '#c4973b' },
  event: { icon: Zap, label: 'Event', color: '#4a7ec4' },
  concept: { icon: Lightbulb, label: 'Concept', color: '#7c5cbf' },
  note: { icon: StickyNote, label: 'Note', color: '#4a9e6d' },
};

interface YarnBoardProps {
  projectId: string;
  boardId: string;
  initialNodes: YarnNode[];
  initialEdges: YarnEdge[];
  onSaveNode: (node: YarnNode) => void;
  onSaveEdge: (edge: YarnEdge) => void;
  onDeleteNode: (id: string) => void;
  onDeleteEdge: (id: string) => void;
}

function YarnNodeComponent({ data }: { data: { title: string; content: string; nodeType: string; color: string } }) {
  const config = NODE_TYPES[data.nodeType as keyof typeof NODE_TYPES] || NODE_TYPES.note;
  const Icon = config.icon;

  return (
    <div
      className="px-4 py-3 rounded-xl border-2 shadow-lg min-w-[160px] max-w-[220px] relative"
      style={{
        backgroundColor: '#1a1a25',
        borderColor: data.color || config.color,
      }}
    >
      {/* Pin */}
      <div
        className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white/20"
        style={{ backgroundColor: data.color || config.color }}
      />

      <div className="flex items-center gap-2 mb-1.5">
        <Icon size={14} style={{ color: data.color || config.color }} />
        <span className="text-xs uppercase tracking-wider" style={{ color: data.color || config.color }}>
          {data.nodeType}
        </span>
      </div>
      <h4 className="font-serif font-bold text-sm text-text-primary leading-tight">
        {data.title}
      </h4>
      {data.content && (
        <p className="text-xs text-text-muted mt-1 line-clamp-3">{data.content}</p>
      )}
    </div>
  );
}

const nodeTypes = { yarn: YarnNodeComponent };

export default function YarnBoard({
  boardId,
  initialNodes,
  initialEdges,
  onSaveNode,
  onSaveEdge,
  onDeleteNode: _onDeleteNode,
  onDeleteEdge: _onDeleteEdge,
  projectId,
}: YarnBoardProps) {
  const [yarnColor, setYarnColor] = useState<keyof typeof YARN_COLORS>('red');
  const [addNodeType, setAddNodeType] = useState<keyof typeof NODE_TYPES>('character');

  const rfNodes: Node[] = initialNodes.map(n => ({
    id: n.id,
    type: 'yarn',
    position: n.position,
    data: { title: n.title, content: n.content, nodeType: n.type, color: n.color },
  }));

  const rfEdges: Edge[] = initialEdges.map(e => ({
    id: e.id,
    source: e.sourceId,
    target: e.targetId,
    style: { stroke: e.color, strokeWidth: 3, strokeDasharray: e.style === 'dashed' ? '8 4' : e.style === 'dotted' ? '3 3' : undefined },
    label: e.label,
    labelStyle: { fill: '#e8e5e0', fontSize: 11 },
    animated: false,
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState(rfNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(rfEdges);

  const onConnect = useCallback((connection: Connection) => {
    const yarnConfig = YARN_COLORS[yarnColor];
    const newEdge: YarnEdge = {
      id: generateId('edge'),
      boardId,
      sourceId: connection.source!,
      targetId: connection.target!,
      color: yarnConfig.color,
      style: 'solid',
      label: yarnConfig.label,
    };
    onSaveEdge(newEdge);

    setEdges((eds) => addEdge({
      ...connection,
      id: newEdge.id,
      style: { stroke: yarnConfig.color, strokeWidth: 3 },
      label: yarnConfig.label,
      labelStyle: { fill: '#e8e5e0', fontSize: 11 },
    }, eds));
  }, [yarnColor, boardId, onSaveEdge, setEdges]);

  const handleAddNode = () => {
    const config = NODE_TYPES[addNodeType];
    const newNode: YarnNode = {
      id: generateId('ynode'),
      projectId,
      boardId,
      type: addNodeType,
      title: `New ${config.label}`,
      content: '',
      color: config.color,
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
    };
    onSaveNode(newNode);

    setNodes((nds) => [...nds, {
      id: newNode.id,
      type: 'yarn',
      position: newNode.position,
      data: { title: newNode.title, content: newNode.content, nodeType: newNode.type, color: newNode.color },
    }]);
  };

  const handleExport = async () => {
    const el = document.querySelector('.react-flow') as HTMLElement;
    if (!el) return;
    const dataUrl = await toPng(el, { backgroundColor: '#07070d' });
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'yarn-board.png';
    a.click();
  };

  return (
    <div className="w-full h-[600px] rounded-xl overflow-hidden border border-border cork-bg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-transparent"
      >
        <Controls className="!bg-surface !border-border !rounded-lg [&_button]:!bg-elevated [&_button]:!border-border [&_button]:!text-text-primary" />
        <MiniMap
          className="!bg-surface !border-border !rounded-lg"
          nodeColor={() => '#c4973b'}
          maskColor="rgba(0,0,0,0.6)"
        />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#2a2a3a" />

        <Panel position="top-left" className="flex items-center gap-2 flex-wrap">
          {/* Add node */}
          <div className="flex items-center gap-1 bg-surface/90 border border-border rounded-lg px-2 py-1.5 backdrop-blur-sm">
            <select
              value={addNodeType}
              onChange={(e) => setAddNodeType(e.target.value as keyof typeof NODE_TYPES)}
              className="bg-transparent text-text-primary text-xs outline-none"
            >
              {Object.entries(NODE_TYPES).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
            <button
              onClick={handleAddNode}
              className="p-1 bg-accent-gold/20 text-accent-gold rounded hover:bg-accent-gold/30 transition"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Yarn color */}
          <div className="flex items-center gap-1 bg-surface/90 border border-border rounded-lg px-2 py-1.5 backdrop-blur-sm">
            <span className="text-[10px] text-text-muted mr-1">Yarn:</span>
            {Object.entries(YARN_COLORS).map(([key, val]) => (
              <button
                key={key}
                onClick={() => setYarnColor(key as keyof typeof YARN_COLORS)}
                className={`w-5 h-5 rounded-full transition-transform ${yarnColor === key ? 'scale-125 ring-1 ring-white/40' : 'hover:scale-110'}`}
                style={{ backgroundColor: val.color }}
                title={val.label}
              />
            ))}
          </div>

          {/* Export */}
          <button
            onClick={handleExport}
            className="flex items-center gap-1 bg-surface/90 border border-border rounded-lg px-2 py-1.5 text-xs text-text-muted hover:text-text-primary transition backdrop-blur-sm"
          >
            <Download size={12} /> Export PNG
          </button>
        </Panel>
      </ReactFlow>
    </div>
  );
}
