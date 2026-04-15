import { Link2 } from 'lucide-react';
import type { EngineDefinition } from '@/engines/_types';
import { registerEngine } from '@/engines/_registry';
import LinksEngine from './LinksEngine';

const linksEngine: EngineDefinition = {
  id: 'links',
  name: 'Links',
  description: 'External reference management',
  icon: Link2,
  category: 'core',
  tables: {
    externalLinks: 'id, projectId, type, *tags',
  },
  component: LinksEngine,
};

registerEngine(linksEngine);

export { linksEngine };
