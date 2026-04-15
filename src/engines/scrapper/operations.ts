// ============================================
// Scrapper Engine — Database Operations
// ============================================

import { db } from '@/db';
import type { Snapshot } from './types';

// ===== Snapshots =====

export async function getSnapshots(projectId: string): Promise<Snapshot[]> {
  return db.table('snapshots')
    .where('projectId')
    .equals(projectId)
    .reverse()
    .sortBy('createdAt') as Promise<Snapshot[]>;
}

export async function getSnapshot(id: string): Promise<Snapshot | undefined> {
  return db.table('snapshots').get(id) as Promise<Snapshot | undefined>;
}

export async function createSnapshot(snapshot: Snapshot): Promise<string> {
  return db.table('snapshots').add(snapshot) as Promise<string>;
}

export async function updateSnapshot(id: string, changes: Partial<Snapshot>): Promise<void> {
  await db.table('snapshots').update(id, changes);
}

export async function deleteSnapshot(id: string): Promise<void> {
  await db.table('snapshots').delete(id);
}

export async function searchSnapshots(projectId: string, query: string): Promise<Snapshot[]> {
  const snapshots = await db.table('snapshots')
    .where('projectId')
    .equals(projectId)
    .toArray() as Snapshot[];

  const q = query.toLowerCase();
  return snapshots.filter(s =>
    s.title.toLowerCase().includes(q) ||
    s.url.toLowerCase().includes(q) ||
    s.notes.toLowerCase().includes(q) ||
    (s.extractedText && s.extractedText.toLowerCase().includes(q))
  );
}
