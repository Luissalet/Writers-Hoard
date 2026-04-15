import { db } from '@/db';
import type { Scene, DialogBlock, SceneCast } from './types';

// ===== Scenes =====
export async function getScenes(projectId: string): Promise<Scene[]> {
  const scenes = await db.table('scenes').where('projectId').equals(projectId).toArray();
  return scenes.sort((a, b) => a.order - b.order);
}

export async function getScene(id: string): Promise<Scene | undefined> {
  return db.table('scenes').get(id);
}

export async function createScene(scene: Scene): Promise<string> {
  return (await db.table('scenes').add(scene)) as string;
}

export async function updateScene(id: string, changes: Partial<Scene>): Promise<void> {
  await db.table('scenes').update(id, { ...changes, updatedAt: Date.now() });
}

export async function deleteScene(id: string): Promise<void> {
  await db.transaction('rw', [db.table('scenes'), db.table('dialogBlocks'), db.table('sceneCasts')], async () => {
    await db.table('scenes').delete(id);
    await db.table('dialogBlocks').where('sceneId').equals(id).delete();
    await db.table('sceneCasts').where('sceneId').equals(id).delete();
  });
}

export async function reorderScenes(projectId: string, orderedIds: string[]): Promise<void> {
  const scenes = await db.table('scenes').where('projectId').equals(projectId).toArray();
  const updates = scenes.map(scene => {
    const newOrder = orderedIds.indexOf(scene.id);
    return { id: scene.id, changes: { order: newOrder, updatedAt: Date.now() } };
  });

  await Promise.all(
    updates.map(({ id, changes }) => db.table('scenes').update(id, changes))
  );
}

// ===== Dialog Blocks =====
export async function getDialogBlocks(sceneId: string): Promise<DialogBlock[]> {
  const blocks = await db.table('dialogBlocks').where('sceneId').equals(sceneId).toArray();
  return blocks.sort((a, b) => a.order - b.order);
}

export async function createDialogBlock(block: DialogBlock): Promise<string> {
  return (await db.table('dialogBlocks').add(block)) as string;
}

export async function updateDialogBlock(id: string, changes: Partial<DialogBlock>): Promise<void> {
  await db.table('dialogBlocks').update(id, { ...changes, updatedAt: Date.now() });
}

export async function deleteDialogBlock(id: string): Promise<void> {
  await db.table('dialogBlocks').delete(id);
}

export async function reorderDialogBlocks(sceneId: string, orderedIds: string[]): Promise<void> {
  const blocks = await db.table('dialogBlocks').where('sceneId').equals(sceneId).toArray();
  const updates = blocks.map(block => {
    const newOrder = orderedIds.indexOf(block.id);
    return { id: block.id, changes: { order: newOrder, updatedAt: Date.now() } };
  });

  await Promise.all(
    updates.map(({ id, changes }) => db.table('dialogBlocks').update(id, changes))
  );
}

// ===== Scene Cast =====
export async function getSceneCast(sceneId: string): Promise<SceneCast[]> {
  return db.table('sceneCasts').where('sceneId').equals(sceneId).toArray();
}

export async function addCastMember(cast: SceneCast): Promise<string> {
  return (await db.table('sceneCasts').add(cast)) as string;
}

export async function removeCastMember(id: string): Promise<void> {
  await db.table('sceneCasts').delete(id);
}

export async function updateCastMember(id: string, changes: Partial<SceneCast>): Promise<void> {
  await db.table('sceneCasts').update(id, changes);
}
