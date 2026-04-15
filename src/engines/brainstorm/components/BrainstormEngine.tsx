// ============================================
// Brainstorm Engine — Root Component
// ============================================

import { useState, useEffect, useMemo } from 'react';
import { Lightbulb, Plus, Trash2, X, ChevronRight } from 'lucide-react';
import type { EngineComponentProps } from '@/engines/_types';
import { useBrainstormBoards, useBrainstormData } from '../hooks';
import BrainstormCanvas from './BrainstormCanvas';
import { generateId } from '@/utils/idGenerator';

export default function BrainstormEngine({ projectId }: EngineComponentProps) {
  const { boards, addBoard, deleteBoard } = useBrainstormBoards(projectId);
  const [activeBoardId, setActiveBoardId] = useState<string>('');
  const [showNewBoard, setShowNewBoard] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const {
    items,
    connections,
    addItem,
    updateItem,
    removeItem,
    addConnection,
    updateConnection,
    removeConnection,
  } = useBrainstormData(activeBoardId);

  // Auto-select first board
  useEffect(() => {
    if (boards.length > 0 && !activeBoardId) {
      setActiveBoardId(boards[0].id);
    }
  }, [boards, activeBoardId]);

  // Ensure at least one board exists
  useEffect(() => {
    if (boards.length === 0) {
      const ensureBoard = async () => {
        const board = {
          id: generateId('board'),
          projectId,
          title: 'Main Board',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        await addBoard(board);
        setActiveBoardId(board.id);
      };
      ensureBoard();
    }
  }, [boards.length, projectId, addBoard]);

  const loading = useMemo(() => boards.length === 0, [boards.length]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-accent-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Canvas */}
      {activeBoardId && (
        <BrainstormCanvas
          projectId={projectId}
          boardId={activeBoardId}
          items={items}
          connections={connections}
          onAddItem={addItem}
          onUpdateItem={updateItem}
          onDeleteItem={removeItem}
          onAddConnection={addConnection}
          onUpdateConnection={updateConnection}
          onDeleteConnection={removeConnection}
        />
      )}

      {/* Boards Dashboard */}
      <div className="border border-border rounded-xl bg-surface/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <Lightbulb size={14} className="text-accent-gold" />
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
                  if (e.key === 'Enter' && newBoardName.trim()) {
                    const board = {
                      id: generateId('board'),
                      projectId,
                      title: newBoardName.trim(),
                      createdAt: Date.now(),
                      updatedAt: Date.now(),
                    };
                    await addBoard(board);
                    setActiveBoardId(board.id);
                    setNewBoardName('');
                    setShowNewBoard(false);
                  }
                  if (e.key === 'Escape') {
                    setShowNewBoard(false);
                    setNewBoardName('');
                  }
                }}
              />
              <button
                onClick={async () => {
                  if (newBoardName.trim()) {
                    const board = {
                      id: generateId('board'),
                      projectId,
                      title: newBoardName.trim(),
                      createdAt: Date.now(),
                      updatedAt: Date.now(),
                    };
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
              <button
                onClick={() => {
                  setShowNewBoard(false);
                  setNewBoardName('');
                }}
                className="p-1.5 text-text-muted hover:text-text-primary transition"
              >
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
            {boards.map((board) => {
              const isActive = board.id === activeBoardId;
              return (
                <div
                  key={board.id}
                  className={`relative group px-3 py-2 rounded-lg border transition cursor-pointer ${
                    isActive
                      ? 'border-accent-gold bg-accent-gold/10'
                      : 'border-border bg-elevated hover:border-accent-gold/50'
                  }`}
                  onClick={() => setActiveBoardId(board.id)}
                >
                  <p className="text-xs font-medium text-text-primary truncate">
                    {board.title}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete "${board.title}"? This cannot be undone.`)) {
                        deleteBoard(board.id);
                      }
                    }}
                    className="absolute top-1 right-1 p-1 rounded text-text-muted hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
