// ============================================
// Writer's Hoard — Core Data Types
// ============================================

// Project (Bubble)
export interface Project {
  id: string;
  title: string;
  type: 'saga' | 'standalone' | 'collection' | 'idea';
  color: string;
  coverImage?: string; // base64 data URL
  description: string;
  parentId?: string; // For books within a saga
  children?: string[]; // IDs of sub-projects
  status: 'draft' | 'in-progress' | 'completed';
  createdAt: number;
  updatedAt: number;
}

// Codex Entry (Wiki)
export type CodexEntryType = 'character' | 'location' | 'item' | 'faction' | 'concept' | 'magic' | 'custom';

export interface CodexEntry {
  id: string;
  projectId: string;
  type: CodexEntryType;
  title: string;
  avatar?: string; // base64 data URL
  fields: Record<string, string>;
  content: string; // HTML from TipTap
  tags: string[];
  relations: Relation[];
  createdAt: number;
  updatedAt: number;
}

// Relation between entities
export interface Relation {
  targetId: string;
  targetTitle: string;
  type: string; // 'ally', 'enemy', 'family', 'located_in', etc.
  description?: string;
}

// Timeline
export interface Timeline {
  id: string;
  projectId: string;
  title: string;
  createdAt: number;
  updatedAt: number;
}

export interface TimelineEvent {
  id: string;
  projectId: string;
  timelineId: string;
  title: string;
  description: string;
  date: string; // Fictional date as free text
  order: number;
  lane: string;
  color: string;
  linkedEntryId?: string;
  createdAt: number;
  updatedAt: number;
}

// Yarn Board
export interface YarnBoard {
  id: string;
  projectId: string;
  title: string;
  createdAt: number;
  updatedAt: number;
}

export interface YarnNode {
  id: string;
  projectId: string;
  boardId: string;
  type: 'character' | 'event' | 'concept' | 'note';
  title: string;
  content: string;
  image?: string; // base64
  color: string;
  position: { x: number; y: number };
  linkedEntryId?: string;
}

export interface YarnEdge {
  id: string;
  boardId: string;
  sourceId: string;
  targetId: string;
  color: string;
  style: 'solid' | 'dashed' | 'dotted';
  label?: string;
}

// Maps
export interface WorldMap {
  id: string;
  projectId: string;
  title: string;
  backgroundImage?: string; // base64
  createdAt: number;
  updatedAt: number;
}

export interface MapPin {
  id: string;
  projectId: string;
  mapId: string;
  name: string;
  icon: 'city' | 'mountain' | 'forest' | 'castle' | 'port' | 'ruins' | 'temple' | 'village' | 'cave' | 'custom';
  position: { x: number; y: number };
  linkedEntryId?: string;
  description?: string;
}

// Gallery
export interface ImageCollection {
  id: string;
  projectId: string;
  title: string;
  createdAt: number;
}

export interface InspirationImage {
  id: string;
  projectId: string;
  collectionId?: string;
  imageData: string; // base64
  thumbnailData?: string; // compressed base64
  tags: string[];
  notes: string;
  linkedEntryId?: string;
  createdAt: number;
}

// Writings
export type WritingStatus = 'idea' | 'draft' | 'finished';

export interface Writing {
  id: string;
  projectId: string;
  title: string;
  status: WritingStatus;
  content: string; // HTML from TipTap
  synopsis?: string;
  wordCount: number;
  chapter?: number;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

// External Links
export type ExternalLinkType = 'google-doc' | 'word-file' | 'youtube' | 'instagram' | 'pinterest' | 'spotify' | 'other';

export interface ExternalLink {
  id: string;
  projectId: string;
  type: ExternalLinkType;
  url: string;
  title: string;
  thumbnail?: string;
  notes: string;
  tags: string[];
  category?: string;
  createdAt: number;
  updatedAt: number;
}

// Tag
export interface Tag {
  id: string;
  name: string;
  color?: string;
}

// Templates for Codex entries
export const CHARACTER_FIELDS = {
  name: '',
  age: '',
  species: '',
  role: '',
  physicalDescription: '',
  personality: '',
  backstory: '',
  abilities: '',
  goals: '',
  flaws: '',
} as const;

export const LOCATION_FIELDS = {
  name: '',
  region: '',
  climate: '',
  population: '',
  history: '',
  notableFeatures: '',
  inhabitants: '',
} as const;

export const ITEM_FIELDS = {
  name: '',
  type: '',
  origin: '',
  properties: '',
  history: '',
  currentOwner: '',
} as const;

export const FACTION_FIELDS = {
  name: '',
  type: '',
  leader: '',
  goals: '',
  territory: '',
  allies: '',
  enemies: '',
  history: '',
} as const;

export function getTemplateFields(type: CodexEntryType): Record<string, string> {
  switch (type) {
    case 'character': return { ...CHARACTER_FIELDS };
    case 'location': return { ...LOCATION_FIELDS };
    case 'item': return { ...ITEM_FIELDS };
    case 'faction': return { ...FACTION_FIELDS };
    default: return { name: '' };
  }
}
