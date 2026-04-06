import Dexie, { type Table } from 'dexie';
import type {
  Project,
  CodexEntry,
  Timeline,
  TimelineEvent,
  YarnBoard,
  YarnNode,
  YarnEdge,
  WorldMap,
  MapPin,
  ImageCollection,
  InspirationImage,
  ExternalLink,
  Writing,
  Tag,
  AppSettings,
} from '../types';

export class WritersHoardDB extends Dexie {
  projects!: Table<Project>;
  codexEntries!: Table<CodexEntry>;
  writings!: Table<Writing>;
  timelines!: Table<Timeline>;
  timelineEvents!: Table<TimelineEvent>;
  yarnBoards!: Table<YarnBoard>;
  yarnNodes!: Table<YarnNode>;
  yarnEdges!: Table<YarnEdge>;
  worldMaps!: Table<WorldMap>;
  mapPins!: Table<MapPin>;
  imageCollections!: Table<ImageCollection>;
  inspirationImages!: Table<InspirationImage>;
  externalLinks!: Table<ExternalLink>;
  tags!: Table<Tag>;
  settings!: Table<AppSettings>;

  constructor() {
    super('WritersHoardDB');
    this.version(2).stores({
      projects: 'id, type, parentId, status, updatedAt',
      codexEntries: 'id, projectId, type, *tags, updatedAt',
      writings: 'id, projectId, status, *tags, updatedAt',
      timelines: 'id, projectId',
      timelineEvents: 'id, projectId, timelineId, order',
      yarnBoards: 'id, projectId',
      yarnNodes: 'id, projectId, boardId',
      yarnEdges: 'id, boardId, sourceId, targetId',
      worldMaps: 'id, projectId',
      mapPins: 'id, projectId, mapId',
      imageCollections: 'id, projectId',
      inspirationImages: 'id, projectId, collectionId, *tags',
      externalLinks: 'id, projectId, type, *tags',
      tags: 'id, name',
    });
    this.version(3).stores({
      projects: 'id, type, parentId, status, updatedAt',
      codexEntries: 'id, projectId, type, *tags, updatedAt',
      writings: 'id, projectId, status, *tags, updatedAt, googleDocId',
      timelines: 'id, projectId',
      timelineEvents: 'id, projectId, timelineId, order',
      yarnBoards: 'id, projectId',
      yarnNodes: 'id, projectId, boardId',
      yarnEdges: 'id, boardId, sourceId, targetId',
      worldMaps: 'id, projectId',
      mapPins: 'id, projectId, mapId',
      imageCollections: 'id, projectId',
      inspirationImages: 'id, projectId, collectionId, *tags',
      externalLinks: 'id, projectId, type, *tags',
      tags: 'id, name',
      settings: 'id, key',
    });

    this.version(4).stores({
      projects: 'id, type, parentId, status, updatedAt',
      codexEntries: 'id, projectId, type, *tags, updatedAt',
      writings: 'id, projectId, status, *tags, updatedAt, googleDocId',
      timelines: 'id, projectId',
      timelineEvents: 'id, projectId, timelineId, order',
      yarnBoards: 'id, projectId',
      yarnNodes: 'id, projectId, boardId',
      yarnEdges: 'id, boardId, sourceId, targetId',
      worldMaps: 'id, projectId',
      mapPins: 'id, projectId, mapId',
      imageCollections: 'id, projectId',
      inspirationImages: 'id, projectId, collectionId, *tags, *linkedEntryIds',
      externalLinks: 'id, projectId, type, *tags',
      tags: 'id, name',
      settings: 'id, key',
    }).upgrade(tx => {
      // Migrate linkedEntryId -> linkedEntryIds
      return tx.table('inspirationImages').toCollection().modify(img => {
        if (img.linkedEntryId && !img.linkedEntryIds) {
          img.linkedEntryIds = [img.linkedEntryId];
        }
        if (!img.linkedEntryIds) {
          img.linkedEntryIds = [];
        }
      });
    });
  }
}

export const db = new WritersHoardDB();
