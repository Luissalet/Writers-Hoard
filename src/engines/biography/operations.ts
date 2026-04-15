import { db } from '@/db';
import type { Biography, BiographyFact } from './types';

// ===== Biographies =====
export async function getBiographies(projectId: string): Promise<Biography[]> {
  return db.table('biographies').where('projectId').equals(projectId).toArray();
}

export async function getBiography(id: string): Promise<Biography | undefined> {
  return db.table('biographies').get(id);
}

export async function createBiography(biography: Biography): Promise<string> {
  return (await db.table('biographies').add(biography)) as string;
}

export async function updateBiography(id: string, changes: Partial<Biography>): Promise<void> {
  await db.table('biographies').update(id, { ...changes, updatedAt: Date.now() });
}

export async function deleteBiography(id: string): Promise<void> {
  await db.transaction('rw', [db.table('biographies'), db.table('biographyFacts')], async () => {
    await db.table('biographies').delete(id);
    await db.table('biographyFacts').where('biographyId').equals(id).delete();
  });
}

// ===== Biography Facts =====
export async function getFacts(biographyId: string): Promise<BiographyFact[]> {
  const facts = await db.table('biographyFacts').where('biographyId').equals(biographyId).toArray();
  return facts.sort((a, b) => a.order - b.order);
}

export async function getFact(id: string): Promise<BiographyFact | undefined> {
  return db.table('biographyFacts').get(id);
}

export async function createFact(fact: BiographyFact): Promise<string> {
  return (await db.table('biographyFacts').add(fact)) as string;
}

export async function updateFact(id: string, changes: Partial<BiographyFact>): Promise<void> {
  await db.table('biographyFacts').update(id, { ...changes, updatedAt: Date.now() });
}

export async function deleteFact(id: string): Promise<void> {
  await db.table('biographyFacts').delete(id);
}

export async function reorderFacts(biographyId: string, orderedIds: string[]): Promise<void> {
  const facts = await db.table('biographyFacts').where('biographyId').equals(biographyId).toArray();
  const updates = facts.map(fact => {
    const newOrder = orderedIds.indexOf(fact.id);
    return { id: fact.id, changes: { order: newOrder, updatedAt: Date.now() } };
  });

  await Promise.all(
    updates.map(({ id, changes }) => db.table('biographyFacts').update(id, changes))
  );
}
