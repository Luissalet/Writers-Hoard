import { useState, useEffect, useCallback } from 'react';
import type { VideoPlan, VideoSegment } from './types';
import * as ops from './operations';

export function useVideoPlans(projectId: string) {
  const [plans, setPlans] = useState<VideoPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    const data = await ops.getVideoPlans(projectId);
    setPlans(data);
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addPlan = useCallback(
    async (plan: VideoPlan) => {
      await ops.createVideoPlan(plan);
      await refresh();
    },
    [refresh]
  );

  const editPlan = useCallback(
    async (id: string, changes: Partial<VideoPlan>) => {
      await ops.updateVideoPlan(id, changes);
      await refresh();
    },
    [refresh]
  );

  const removePlan = useCallback(
    async (id: string) => {
      await ops.deleteVideoPlan(id);
      await refresh();
    },
    [refresh]
  );

  return { plans, loading, addPlan, editPlan, removePlan, refresh };
}

export function useVideoSegments(videoPlanId: string) {
  const [segments, setSegments] = useState<VideoSegment[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!videoPlanId) return;
    setLoading(true);
    const data = await ops.getSegments(videoPlanId);
    setSegments(data);
    setLoading(false);
  }, [videoPlanId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addSegment = useCallback(
    async (segment: VideoSegment) => {
      await ops.createSegment(segment);
      await refresh();
    },
    [refresh]
  );

  const editSegment = useCallback(
    async (id: string, changes: Partial<VideoSegment>) => {
      await ops.updateSegment(id, changes);
      await refresh();
    },
    [refresh]
  );

  const removeSegment = useCallback(
    async (id: string) => {
      await ops.deleteSegment(id);
      await refresh();
    },
    [refresh]
  );

  const reorder = useCallback(
    async (orderedIds: string[]) => {
      await ops.reorderSegments(videoPlanId, orderedIds);
      await refresh();
    },
    [videoPlanId, refresh]
  );

  return { segments, loading, addSegment, editSegment, removeSegment, reorder, refresh };
}
