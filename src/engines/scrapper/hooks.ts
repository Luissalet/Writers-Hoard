// ============================================
// Scrapper Engine — React Hooks
// ============================================

import { useState, useEffect, useCallback } from 'react';
import type { Snapshot } from './types';
import * as ops from './operations';

export function useSnapshots(projectId: string) {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    const data = await ops.getSnapshots(projectId);
    setSnapshots(data);
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addSnapshot = useCallback(async (snapshot: Snapshot) => {
    await ops.createSnapshot(snapshot);
    await refresh();
  }, [refresh]);

  const editSnapshot = useCallback(async (id: string, changes: Partial<Snapshot>) => {
    await ops.updateSnapshot(id, changes);
    await refresh();
  }, [refresh]);

  const removeSnapshot = useCallback(async (id: string) => {
    await ops.deleteSnapshot(id);
    await refresh();
  }, [refresh]);

  return {
    snapshots,
    loading,
    addSnapshot,
    editSnapshot,
    removeSnapshot,
    refresh,
  };
}
