import { BookOpen } from 'lucide-react';
import type { EngineDefinition } from '@/engines/_types';
import { registerEngine } from '@/engines/_registry';
import CodexEngine from './CodexEngine';

const codexEngine: EngineDefinition = {
  id: 'codex',
  name: 'Codex',
  description: 'Encyclopedia of characters, locations, items, and world details',
  icon: BookOpen,
  category: 'core',
  tables: {
    codexEntries: 'id, projectId, type, *tags, updatedAt',
  },
  component: CodexEngine,
};

registerEngine(codexEngine);

export { codexEngine };
