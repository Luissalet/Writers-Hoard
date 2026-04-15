import { useState, useEffect, useCallback } from 'react';
import type { Biography, BiographyFact } from './types';
import * as ops from './operations';

export function useBiographies(projectId: string) {
  const [biographies, setBiographies] = useState<Biography[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    const data = await ops.getBiographies(projectId);
    setBiographies(data);
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addBiography = useCallback(
    async (biography: Biography) => {
      await ops.createBiography(biography);
      await refresh();
    },
    [refresh]
  );

  const editBiography = useCallback(
    async (id: string, changes: Partial<Biography>) => {
      await ops.updateBiography(id, changes);
      await refresh();
    },
    [refresh]
  );

  const removeBiography = useCallback(
    async (id: string) => {
      await ops.deleteBiography(id);
      await refresh();
    },
    [refresh]
  );

  return { biographies, loading, addBiography, editBiography, removeBiography, refresh };
}

export function useBiographyFacts(biographyId: string) {
  const [facts, setFacts] = useState<BiographyFact[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!biographyId) return;
    setLoading(true);
    const data = await ops.getFacts(biographyId);
    setFacts(data);
    setLoading(false);
  }, [biographyId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addFact = useCallback(
    async (fact: BiographyFact) => {
      await ops.createFact(fact);
      await refresh();
    },
    [refresh]
  );

  const editFact = useCallback(
    async (id: string, changes: Partial<BiographyFact>) => {
      await ops.updateFact(id, changes);
      await refresh();
    },
    [refresh]
  );

  const removeFact = useCallback(
    async (id: string) => {
      await ops.deleteFact(id);
      await refresh();
    },
    [refresh]
  );

  const reorder = useCallback(
    async (orderedIds: string[]) => {
      await ops.reorderFacts(biographyId, orderedIds);
      await refresh();
    },
    [biographyId, refresh]
  );

  return { facts, loading, addFact, editFact, removeFact, reorder, refresh };
}
