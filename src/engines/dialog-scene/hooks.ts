import { useState, useEffect, useCallback } from 'react';
import type { Scene, DialogBlock, SceneCast } from './types';
import * as ops from './operations';

export function useScenes(projectId: string) {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    const data = await ops.getScenes(projectId);
    setScenes(data);
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addScene = useCallback(
    async (scene: Scene) => {
      await ops.createScene(scene);
      await refresh();
    },
    [refresh]
  );

  const editScene = useCallback(
    async (id: string, changes: Partial<Scene>) => {
      await ops.updateScene(id, changes);
      await refresh();
    },
    [refresh]
  );

  const removeScene = useCallback(
    async (id: string) => {
      await ops.deleteScene(id);
      await refresh();
    },
    [refresh]
  );

  const reorder = useCallback(
    async (orderedIds: string[]) => {
      await ops.reorderScenes(projectId, orderedIds);
      await refresh();
    },
    [projectId, refresh]
  );

  return { scenes, loading, addScene, editScene, removeScene, reorder, refresh };
}

export function useDialogBlocks(sceneId: string) {
  const [blocks, setBlocks] = useState<DialogBlock[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!sceneId) return;
    setLoading(true);
    const data = await ops.getDialogBlocks(sceneId);
    setBlocks(data);
    setLoading(false);
  }, [sceneId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addBlock = useCallback(
    async (block: DialogBlock) => {
      await ops.createDialogBlock(block);
      await refresh();
    },
    [refresh]
  );

  const editBlock = useCallback(
    async (id: string, changes: Partial<DialogBlock>) => {
      await ops.updateDialogBlock(id, changes);
      await refresh();
    },
    [refresh]
  );

  const removeBlock = useCallback(
    async (id: string) => {
      await ops.deleteDialogBlock(id);
      await refresh();
    },
    [refresh]
  );

  const reorder = useCallback(
    async (orderedIds: string[]) => {
      await ops.reorderDialogBlocks(sceneId, orderedIds);
      await refresh();
    },
    [sceneId, refresh]
  );

  return { blocks, loading, addBlock, editBlock, removeBlock, reorder, refresh };
}

export function useSceneCast(sceneId: string) {
  const [cast, setCast] = useState<SceneCast[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!sceneId) return;
    setLoading(true);
    const data = await ops.getSceneCast(sceneId);
    setCast(data);
    setLoading(false);
  }, [sceneId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addMember = useCallback(
    async (member: SceneCast) => {
      await ops.addCastMember(member);
      await refresh();
    },
    [refresh]
  );

  const removeMember = useCallback(
    async (id: string) => {
      await ops.removeCastMember(id);
      await refresh();
    },
    [refresh]
  );

  const updateMember = useCallback(
    async (id: string, changes: Partial<SceneCast>) => {
      await ops.updateCastMember(id, changes);
      await refresh();
    },
    [refresh]
  );

  return { cast, loading, addMember, removeMember, updateMember, refresh };
}
