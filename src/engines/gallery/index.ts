import { Image } from 'lucide-react';
import type { EngineDefinition } from '@/engines/_types';
import { registerEngine } from '@/engines/_registry';
import GalleryEngine from './GalleryEngine';

const galleryEngine: EngineDefinition = {
  id: 'gallery',
  name: 'Gallery',
  description: 'Image collections with tagging and albums',
  icon: Image,
  category: 'core',
  tables: {
    imageCollections: 'id, projectId',
    inspirationImages: 'id, projectId, collectionId, *tags, *linkedEntryIds',
  },
  component: GalleryEngine,
};

registerEngine(galleryEngine);

export { galleryEngine };
