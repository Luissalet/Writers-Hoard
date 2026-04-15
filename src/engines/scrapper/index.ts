// ============================================
// Scrapper Engine — Registration
// ============================================

import { Globe } from 'lucide-react';
import type { EngineDefinition } from '@/engines/_types';
import { registerEngine } from '@/engines/_registry';
import ScrapperEngine from './components/ScrapperEngine';

const scrapperEngine: EngineDefinition = {
  id: 'scrapper',
  name: 'Scrapper',
  description: 'Capture and archive web content for research',
  icon: Globe,
  category: 'research',
  tables: {
    snapshots: 'id, projectId, source, status, createdAt',
  },
  component: ScrapperEngine,
};

registerEngine(scrapperEngine);

export { scrapperEngine };
