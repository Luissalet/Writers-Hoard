// ============================================
// Storyboard Engine — React Hooks
// ============================================

import { useState, useEffect, useCallback } from 'react';
import type { Storyboard, StoryboardPanel, StoryboardConnector } from './types';
import * as ops from './operations';

export function useStoryboards(projectId: string) {
  const [storyboards, setStoryboards] = useState<Storyboard[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    const data = await ops.getStoryboards(projectId);
    setStoryboards(data);
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addStoryboard = useCallback(async (storyboard: Storyboard) => {
    await ops.createStoryboard(storyboard);
    await refresh();
  }, [refresh]);

  const updateStoryboard = useCallback(async (id: string, changes: Partial<Storyboard>) => {
    await ops.updateStoryboard(id, changes);
    await refresh();
  }, [refresh]);

  const deleteStoryboard = useCallback(async (id: string) => {
    await ops.deleteStoryboard(id);
    await refresh();
  }, [refresh]);

  return { storyboards, loading, refresh, addStoryboard, updateStoryboard, deleteStoryboard };
}

export function useStoryboardPanels(storyboardId: string) {
  const [panels, setPanels] = useState<StoryboardPanel[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!storyboardId) return;
    setLoading(true);
    const data = await ops.getPanels(storyboardId);
    setPanels(data);
    setLoading(false);
  }, [storyboardId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addPanel = useCallback(async (panel: StoryboardPanel) => {
    await ops.createPanel(panel);
    await refresh();
  }, [refresh]);

  const updatePanel = useCallback(async (id: string, changes: Partial<StoryboardPanel>) => {
    await ops.updatePanel(id, changes);
    await refresh();
  }, [refresh]);

  const deletePanel = useCallback(async (id: string) => {
    await ops.deletePanel(id);
    await refresh();
  }, [refresh]);

  const reorderPanels = useCallback(async (panelIds: string[]) => {
    await ops.reorderPanels(storyboardId, panelIds);
    await refresh();
  }, [storyboardId, refresh]);

  return { panels, loading, refresh, addPanel, updatePanel, deletePanel, reorderPanels };
}

export function useStoryboardConnectors(storyboardId: string) {
  const [connectors, setConnectors] = useState<StoryboardConnector[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!storyboardId) return;
    setLoading(true);
    const data = await ops.getConnectors(storyboardId);
    setConnectors(data);
    setLoading(false);
  }, [storyboardId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addConnector = useCallback(async (connector: StoryboardConnector) => {
    await ops.createConnector(connector);
    await refresh();
  }, [refresh]);

  const updateConnector = useCallback(async (id: string, changes: Partial<StoryboardConnector>) => {
    await ops.updateConnector(id, changes);
    await refresh();
  }, [refresh]);

  const deleteConnector = useCallback(async (id: string) => {
    await ops.deleteConnector(id);
    await refresh();
  }, [refresh]);

  return { connectors, loading, refresh, addConnector, updateConnector, deleteConnector };
}
