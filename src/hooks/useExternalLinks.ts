import { useState, useEffect, useCallback } from 'react';
import type { ExternalLink } from '@/types';
import * as ops from '@/db/operations';

export function useExternalLinks(projectId: string) {
  const [links, setLinks] = useState<ExternalLink[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    const data = await ops.getExternalLinks(projectId);
    setLinks(data);
    setLoading(false);
  }, [projectId]);

  useEffect(() => { refresh(); }, [refresh]);

  const addLink = useCallback(async (link: ExternalLink) => {
    await ops.createExternalLink(link);
    await refresh();
  }, [refresh]);

  const editLink = useCallback(async (id: string, changes: Partial<ExternalLink>) => {
    await ops.updateExternalLink(id, changes);
    await refresh();
  }, [refresh]);

  const removeLink = useCallback(async (id: string) => {
    await ops.deleteExternalLink(id);
    await refresh();
  }, [refresh]);

  return { links, loading, refresh, addLink, editLink, removeLink };
}
