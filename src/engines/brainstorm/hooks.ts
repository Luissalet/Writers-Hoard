// ============================================
// Brainstorm Engine — React Hooks
// ============================================

import { useState, useEffect, useCallback } from 'react';
import type { BrainstormBoard, BrainstormItem, BrainstormConnection } from './types';
import * as ops from './operations';

export function useBrainstormBoards(projectId: string) {
  const [boards, setBoards] = useState<BrainstormBoard[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    const data = await ops.getBrainstormBoards(projectId);
    setBoards(data);
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addBoard = useCallback(async (board: BrainstormBoard) => {
    await ops.createBrainstormBoard(board);
    await refresh();
  }, [refresh]);

  const updateBoard = useCallback(async (id: string, changes: Partial<BrainstormBoard>) => {
    await ops.updateBrainstormBoard(id, changes);
    await refresh();
  }, [refresh]);

  const deleteBoard = useCallback(async (id: string) => {
    await ops.deleteBrainstormBoard(id);
    await refresh();
  }, [refresh]);

  return { boards, loading, refresh, addBoard, updateBoard, deleteBoard };
}

export function useBrainstormData(boardId: string) {
  const [items, setItems] = useState<BrainstormItem[]>([]);
  const [connections, setConnections] = useState<BrainstormConnection[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!boardId) return;
    setLoading(true);
    const [itemsData, connectionsData] = await Promise.all([
      ops.getBrainstormItems(boardId),
      ops.getBrainstormConnections(boardId),
    ]);
    setItems(itemsData);
    setConnections(connectionsData);
    setLoading(false);
  }, [boardId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = useCallback(async (item: BrainstormItem) => {
    await ops.createBrainstormItem(item);
    await refresh();
  }, [refresh]);

  const updateItem = useCallback(async (id: string, changes: Partial<BrainstormItem>) => {
    await ops.updateBrainstormItem(id, changes);
    await refresh();
  }, [refresh]);

  const removeItem = useCallback(async (id: string) => {
    await ops.deleteBrainstormItem(id);
    await refresh();
  }, [refresh]);

  const addConnection = useCallback(async (connection: BrainstormConnection) => {
    await ops.createBrainstormConnection(connection);
    await refresh();
  }, [refresh]);

  const updateConnection = useCallback(async (id: string, changes: Partial<BrainstormConnection>) => {
    await ops.updateBrainstormConnection(id, changes);
    await refresh();
  }, [refresh]);

  const removeConnection = useCallback(async (id: string) => {
    await ops.deleteBrainstormConnection(id);
    await refresh();
  }, [refresh]);

  return {
    items,
    connections,
    loading,
    addItem,
    updateItem,
    removeItem,
    addConnection,
    updateConnection,
    removeConnection,
    refresh,
  };
}
