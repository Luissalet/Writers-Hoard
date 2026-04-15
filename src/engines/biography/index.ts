import { BookUser } from 'lucide-react';
import type { EngineDefinition } from '@/engines/_types';
import { registerEngine } from '@/engines/_registry';
import BiographyEngine from './components/BiographyEngine';

const biographyEngine: EngineDefinition = {
  id: 'biography',
  name: 'Biography',
  description: 'Build biographies from facts, events, and sources',
  icon: BookUser,
  category: 'creative',
  tables: {
    biographies: 'id, projectId',
    biographyFacts: 'id, biographyId, projectId, order, category',
  },
  component: BiographyEngine,
};

registerEngine(biographyEngine);

export { biographyEngine };
