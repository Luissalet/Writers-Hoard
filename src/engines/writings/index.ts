import { PenLine } from 'lucide-react';
import type { EngineDefinition } from '@/engines/_types';
import { registerEngine } from '@/engines/_registry';
import WritingsEngine from './WritingsEngine';

const writingsEngine: EngineDefinition = {
  id: 'writings',
  name: 'Writings',
  description: 'Write and manage drafts, chapters, and manuscripts',
  icon: PenLine,
  category: 'core',
  tables: {
    writings: 'id, projectId, status, *tags, updatedAt, googleDocId',
  },
  component: WritingsEngine,
};

registerEngine(writingsEngine);

export { writingsEngine };
