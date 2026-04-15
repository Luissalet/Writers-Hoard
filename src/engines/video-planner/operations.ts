import { db } from '@/db';
import type { VideoPlan, VideoSegment } from './types';

// ===== Video Plans =====
export async function getVideoPlans(projectId: string): Promise<VideoPlan[]> {
  return db.table('videoPlans').where('projectId').equals(projectId).toArray();
}

export async function getVideoPlan(id: string): Promise<VideoPlan | undefined> {
  return db.table('videoPlans').get(id);
}

export async function createVideoPlan(plan: VideoPlan): Promise<string> {
  const id = await db.table('videoPlans').add(plan);
  return String(id);
}

export async function updateVideoPlan(id: string, changes: Partial<VideoPlan>): Promise<void> {
  await db.table('videoPlans').update(id, { ...changes, updatedAt: Date.now() });
}

export async function deleteVideoPlan(id: string): Promise<void> {
  await db.transaction('rw', [db.table('videoPlans'), db.table('videoSegments')], async () => {
    await db.table('videoPlans').delete(id);
    await db.table('videoSegments').where('videoPlanId').equals(id).delete();
  });
}

// ===== Video Segments =====
export async function getSegments(videoPlanId: string): Promise<VideoSegment[]> {
  const segments = await db.table('videoSegments').where('videoPlanId').equals(videoPlanId).toArray();
  return segments.sort((a, b) => a.order - b.order);
}

export async function getSegment(id: string): Promise<VideoSegment | undefined> {
  return db.table('videoSegments').get(id);
}

export async function createSegment(segment: VideoSegment): Promise<string> {
  const id = await db.table('videoSegments').add(segment);
  return String(id);
}

export async function updateSegment(id: string, changes: Partial<VideoSegment>): Promise<void> {
  await db.table('videoSegments').update(id, { ...changes, updatedAt: Date.now() });
}

export async function deleteSegment(id: string): Promise<void> {
  await db.table('videoSegments').delete(id);
}

export async function reorderSegments(videoPlanId: string, orderedIds: string[]): Promise<void> {
  const segments = await db.table('videoSegments').where('videoPlanId').equals(videoPlanId).toArray();
  const updates = segments.map(segment => {
    const newOrder = orderedIds.indexOf(segment.id);
    return { id: segment.id, changes: { order: newOrder, updatedAt: Date.now() } };
  });

  await Promise.all(
    updates.map(({ id, changes }) => db.table('videoSegments').update(id, changes))
  );
}
