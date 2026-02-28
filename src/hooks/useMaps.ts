import { useState, useEffect, useCallback } from 'react';
import type { WorldMap, MapPin } from '@/types';
import * as ops from '@/db/operations';

export function useWorldMaps(projectId: string) {
  const [maps, setMaps] = useState<WorldMap[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    const data = await ops.getWorldMaps(projectId);
    setMaps(data);
    setLoading(false);
  }, [projectId]);

  useEffect(() => { refresh(); }, [refresh]);

  const addMap = useCallback(async (map: WorldMap) => {
    await ops.createWorldMap(map);
    await refresh();
  }, [refresh]);

  const editMap = useCallback(async (id: string, changes: Partial<WorldMap>) => {
    await ops.updateWorldMap(id, changes);
    await refresh();
  }, [refresh]);

  const removeMap = useCallback(async (id: string) => {
    await ops.deleteWorldMap(id);
    await refresh();
  }, [refresh]);

  return { maps, loading, refresh, addMap, editMap, removeMap };
}

export function useMapPins(mapId: string) {
  const [pins, setPins] = useState<MapPin[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!mapId) return;
    setLoading(true);
    const data = await ops.getMapPins(mapId);
    setPins(data);
    setLoading(false);
  }, [mapId]);

  useEffect(() => { refresh(); }, [refresh]);

  const addPin = useCallback(async (pin: MapPin) => {
    await ops.createMapPin(pin);
    await refresh();
  }, [refresh]);

  const editPin = useCallback(async (id: string, changes: Partial<MapPin>) => {
    await ops.updateMapPin(id, changes);
    await refresh();
  }, [refresh]);

  const removePin = useCallback(async (id: string) => {
    await ops.deleteMapPin(id);
    await refresh();
  }, [refresh]);

  return { pins, loading, refresh, addPin, editPin, removePin };
}
