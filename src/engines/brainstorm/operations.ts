// ============================================
// Brainstorm Engine — Database Operations
// ============================================

import { db } from '@/db';
import type { BrainstormBoard, BrainstormItem, BrainstormConnection } from './types';

// ===== Brainstorm Boards =====

export async function getBrainstormBoards(projectId: string): Promise<BrainstormBoard[]> {
  return db.table('brainstormBoards')
    .where('projectId')
    .equals(projectId)
    .toArray() as Promise<BrainstormBoard[]>;
}

export async function getBrainstormBoard(id: string): Promise<BrainstormBoard | undefined> {
  return db.table('brainstormBoards').get(id) as Promise<BrainstormBoard | undefined>;
}

export async function createBrainstormBoard(board: BrainstormBoard): Promise<string> {
  return db.table('brainstormBoards').add(board) as Promise<string>;
}

export async function updateBrainstormBoard(id: string, changes: Partial<BrainstormBoard>): Promise<void> {
  await db.table('brainstormBoards').update(id, { ...changes, updatedAt: Date.now() });
}

export async function deleteBrainstormBoard(id: string): Promise<void> {
  await db.transaction('rw', ['brainstormBoards', 'brainstormItems', 'brainstormConnections'], async (tx) => {
    await tx.table('brainstormBoards').delete(id);
    await tx.table('brainstormItems').where('boardId').equals(id).delete();
    await tx.table('brainstormConnections').where('boardId').equals(id).delete();
  });
}

// ===== Brainstorm Items =====

export async function getBrainstormItems(boardId: string): Promise<BrainstormItem[]> {
  return db.table('brainstormItems')
    .where('boardId')
    .equals(boardId)
    .toArray() as Promise<BrainstormItem[]>;
}

export async function getBrainstormItem(id: string): Promise<BrainstormItem | undefined> {
  return db.table('brainstormItems').get(id) as Promise<BrainstormItem | undefined>;
}

export async function createBrainstormItem(item: BrainstormItem): Promise<string> {
  return db.table('brainstormItems').add(item) as Promise<string>;
}

export async function updateBrainstormItem(id: string, changes: Partial<BrainstormItem>): Promise<void> {
  await db.table('brainstormItems').update(id, { ...changes, updatedAt: Date.now() });
}

export async function deleteBrainstormItem(id: string): Promise<void> {
  await db.transaction('rw', ['brainstormItems', 'brainstormConnections'], async (tx) => {
    await tx.table('brainstormItems').delete(id);
    await tx.table('brainstormConnections')
      .where('sourceId')
      .equals(id)
      .delete();
    await tx.table('brainstormConnections')
      .where('targetId')
      .equals(id)
      .delete();
  });
}

// ===== Brainstorm Connections =====

export async function getBrainstormConnections(boardId: string): Promise<BrainstormConnection[]> {
  return db.table('brainstormConnections')
    .where('boardId')
    .equals(boardId)
    .toArray() as Promise<BrainstormConnection[]>;
}

export async function getBrainstormConnection(id: string): Promise<BrainstormConnection | undefined> {
  return db.table('brainstormConnections').get(id) as Promise<BrainstormConnection | undefined>;
}

export async function createBrainstormConnection(connection: BrainstormConnection): Promise<string> {
  return db.table('brainstormConnections').add(connection) as Promise<string>;
}

export async function updateBrainstormConnection(id: string, changes: Partial<BrainstormConnection>): Promise<void> {
  await db.table('brainstormConnections').update(id, changes);
}

export async function deleteBrainstormConnection(id: string): Promise<void> {
  await db.table('brainstormConnections').delete(id);
}

export async function deleteConnectionsBySource(sourceId: string): Promise<void> {
  await db.table('brainstormConnections')
    .where('sourceId')
    .equals(sourceId)
    .delete();
}

export async function deleteConnectionsByTarget(targetId: string): Promise<void> {
  await db.table('brainstormConnections')
    .where('targetId')
    .equals(targetId)
    .delete();
}
