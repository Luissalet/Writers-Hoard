// ============================================
// Generic CRUD Hook Factory
// Eliminates per-engine hook boilerplate
// ============================================

import { useState, useEffect, useCallback } from 'react';

/**
 * Generic hook that fetches a list of items by a context key (e.g. projectId, boardId)
 * and provides refresh + loading state. Engine-specific hooks compose on top of this.
 */
export function useCRUD<T>(
  fetchFn: (contextId: string) => Promise<T[]>,
  contextId: string,
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!contextId) {
      setData([]);
      setLoading(false);
      return;
    }
    const items = await fetchFn(contextId);
    setData(items);
    setLoading(false);
  }, [contextId, fetchFn]);

  useEffect(() => {
    setLoading(true);
    refresh();
  }, [refresh]);

  return { data, loading, refresh, setData };
}
