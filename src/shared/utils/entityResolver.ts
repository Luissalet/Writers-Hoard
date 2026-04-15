// ============================================
// Cross-Engine Entity Resolution
// Resolves (entityId, entityType) → preview data
// ============================================

import type { EntityPreview } from '@/engines/_types';

/**
 * Maps an entity type string to the engine that owns it.
 * Convention: entityType is either the engine ID itself ('codex', 'timeline')
 * or a more specific type within that engine ('codex-entry', 'timeline-event').
 */
const ENTITY_TYPE_TO_ENGINE: Record<string, string> = {
  // Codex
  'codex': 'codex',
  'codex-entry': 'codex',
  'character': 'codex',
  'location': 'codex',
  // Timeline
  'timeline': 'timeline',
  'timeline-event': 'timeline',
  // Writings
  'writings': 'writings',
  'writing': 'writings',
  // Yarn Board
  'yarn-board': 'yarn-board',
  'yarn-node': 'yarn-board',
  // Gallery
  'gallery': 'gallery',
  'image': 'gallery',
  // Maps
  'maps': 'maps',
  'map-pin': 'maps',
  // Links
  'links': 'links',
  'link': 'links',
  // Scrapper
  'scrapper': 'scrapper',
  'snapshot': 'scrapper',
  // Dialog / Scene
  'dialog-scene': 'dialog-scene',
  'scene': 'dialog-scene',
  'dialog-block': 'dialog-scene',
  // Storyboard
  'storyboard': 'storyboard',
  'panel': 'storyboard',
  // Biography
  'biography': 'biography',
  'biography-fact': 'biography',
  // Video Planner
  'video-planner': 'video-planner',
  'video-segment': 'video-planner',
  // Brainstorm
  'brainstorm': 'brainstorm',
};

export function entityTypeToEngineId(entityType: string): string | undefined {
  return ENTITY_TYPE_TO_ENGINE[entityType];
}

/**
 * Resolve an entity to a preview card. Returns null if the engine
 * doesn't implement getPreview or the entity doesn't exist.
 */
export async function resolveEntity(
  _entityId: string,
  _entityType: string,
): Promise<EntityPreview | null> {
  // TODO: Each engine will register a getPreview function.
  // For now, return null — engines will implement this as they mature.
  return null;
}

/**
 * Search across all engines (or a subset) for entities matching a query.
 */
export async function searchEntities(
  _query: string,
  _engineIds?: string[],
): Promise<EntityPreview[]> {
  // TODO: Each engine will register a search function.
  return [];
}
