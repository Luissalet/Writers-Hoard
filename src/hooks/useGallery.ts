import { useState, useEffect, useCallback } from 'react';
import type { InspirationImage, ImageCollection } from '@/types';
import * as ops from '@/db/operations';

export function useImageCollections(projectId: string) {
  const [collections, setCollections] = useState<ImageCollection[]>([]);

  const refresh = useCallback(async () => {
    if (!projectId) return;
    const data = await ops.getImageCollections(projectId);
    setCollections(data);
  }, [projectId]);

  useEffect(() => { refresh(); }, [refresh]);

  const addCollection = useCallback(async (collection: ImageCollection) => {
    await ops.createImageCollection(collection);
    await refresh();
  }, [refresh]);

  const removeCollection = useCallback(async (id: string) => {
    await ops.deleteImageCollection(id);
    await refresh();
  }, [refresh]);

  return { collections, refresh, addCollection, removeCollection };
}

export function useInspirationImages(projectId: string) {
  const [images, setImages] = useState<InspirationImage[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    const data = await ops.getInspirationImages(projectId);
    setImages(data);
    setLoading(false);
  }, [projectId]);

  useEffect(() => { refresh(); }, [refresh]);

  const addImage = useCallback(async (image: InspirationImage) => {
    await ops.createInspirationImage(image);
    await refresh();
  }, [refresh]);

  const editImage = useCallback(async (id: string, changes: Partial<InspirationImage>) => {
    await ops.updateInspirationImage(id, changes);
    await refresh();
  }, [refresh]);

  const removeImage = useCallback(async (id: string) => {
    await ops.deleteInspirationImage(id);
    await refresh();
  }, [refresh]);

  return { images, loading, refresh, addImage, editImage, removeImage };
}
