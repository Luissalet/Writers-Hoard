// ============================================
// Storyboard Engine — Database Operations
// ============================================

import { db } from '@/db';
import type { Storyboard, StoryboardPanel, StoryboardConnector } from './types';

// ===== Storyboards =====

export async function getStoryboards(projectId: string): Promise<Storyboard[]> {
  return db.table('storyboards')
    .where('projectId')
    .equals(projectId)
    .toArray() as Promise<Storyboard[]>;
}

export async function getStoryboard(id: string): Promise<Storyboard | undefined> {
  return db.table('storyboards').get(id) as Promise<Storyboard | undefined>;
}

export async function createStoryboard(storyboard: Storyboard): Promise<string> {
  return db.table('storyboards').add(storyboard) as Promise<string>;
}

export async function updateStoryboard(id: string, changes: Partial<Storyboard>): Promise<void> {
  await db.table('storyboards').update(id, { ...changes, updatedAt: Date.now() });
}

export async function deleteStoryboard(id: string): Promise<void> {
  await db.transaction('rw', ['storyboards', 'storyboardPanels', 'storyboardConnectors'], async (tx) => {
    await tx.table('storyboards').delete(id);
    await tx.table('storyboardPanels').where('storyboardId').equals(id).delete();
    await tx.table('storyboardConnectors').where('storyboardId').equals(id).delete();
  });
}

// ===== Storyboard Panels =====

export async function getPanels(storyboardId: string): Promise<StoryboardPanel[]> {
  return db.table('storyboardPanels')
    .where('storyboardId')
    .equals(storyboardId)
    .sortBy('order') as Promise<StoryboardPanel[]>;
}

export async function getPanel(id: string): Promise<StoryboardPanel | undefined> {
  return db.table('storyboardPanels').get(id) as Promise<StoryboardPanel | undefined>;
}

export async function createPanel(panel: StoryboardPanel): Promise<string> {
  return db.table('storyboardPanels').add(panel) as Promise<string>;
}

export async function updatePanel(id: string, changes: Partial<StoryboardPanel>): Promise<void> {
  await db.table('storyboardPanels').update(id, { ...changes, updatedAt: Date.now() });
}

export async function deletePanel(id: string): Promise<void> {
  await db.transaction('rw', ['storyboardPanels', 'storyboardConnectors'], async (tx) => {
    await tx.table('storyboardPanels').delete(id);
    await tx.table('storyboardConnectors')
      .where('sourceId')
      .equals(id)
      .delete();
    await tx.table('storyboardConnectors')
      .where('targetId')
      .equals(id)
      .delete();
  });
}

export async function reorderPanels(_storyboardId: string, panelIds: string[]): Promise<void> {
  await db.transaction('rw', ['storyboardPanels'], async (tx) => {
    for (let i = 0; i < panelIds.length; i++) {
      await tx.table('storyboardPanels').update(panelIds[i], { order: i, updatedAt: Date.now() });
    }
  });
}

// ===== Storyboard Connectors =====

export async function getConnectors(storyboardId: string): Promise<StoryboardConnector[]> {
  return db.table('storyboardConnectors')
    .where('storyboardId')
    .equals(storyboardId)
    .toArray() as Promise<StoryboardConnector[]>;
}

export async function getConnector(id: string): Promise<StoryboardConnector | undefined> {
  return db.table('storyboardConnectors').get(id) as Promise<StoryboardConnector | undefined>;
}

export async function createConnector(connector: StoryboardConnector): Promise<string> {
  return db.table('storyboardConnectors').add(connector) as Promise<string>;
}

export async function updateConnector(id: string, changes: Partial<StoryboardConnector>): Promise<void> {
  await db.table('storyboardConnectors').update(id, changes);
}

export async function deleteConnector(id: string): Promise<void> {
  await db.table('storyboardConnectors').delete(id);
}

export async function deleteConnectorsBySource(sourceId: string): Promise<void> {
  await db.table('storyboardConnectors')
    .where('sourceId')
    .equals(sourceId)
    .delete();
}

export async function deleteConnectorsByTarget(targetId: string): Promise<void> {
  await db.table('storyboardConnectors')
    .where('targetId')
    .equals(targetId)
    .delete();
}

export async function getConnectorBetweenPanels(fromPanelId: string, toPanelId: string): Promise<StoryboardConnector | undefined> {
  const connectors = await db.table('storyboardConnectors')
    .where('sourceId')
    .equals(fromPanelId)
    .toArray() as StoryboardConnector[];
  return connectors.find(c => c.targetId === toPanelId);
}
