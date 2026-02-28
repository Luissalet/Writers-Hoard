import { useState, useEffect, useCallback } from 'react';
import type { CodexEntry } from '@/types';
import * as ops from '@/db/operations';

export function useCodexEntries(projectId: string) {
  const [entries, setEntries] = useState<CodexEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    const data = await ops.getCodexEntries(projectId);
    setEntries(data);
    setLoading(false);
  }, [projectId]);

  useEffect(() => { refresh(); }, [refresh]);

  const addEntry = useCallback(async (entry: CodexEntry) => {
    await ops.createCodexEntry(entry);
    await refresh();
  }, [refresh]);

  const editEntry = useCallback(async (id: string, changes: Partial<CodexEntry>) => {
    await ops.updateCodexEntry(id, changes);
    await refresh();
  }, [refresh]);

  const removeEntry = useCallback(async (id: string) => {
    await ops.deleteCodexEntry(id);
    await refresh();
  }, [refresh]);

  return { entries, loading, refresh, addEntry, editEntry, removeEntry };
}
