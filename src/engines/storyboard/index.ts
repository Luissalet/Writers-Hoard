// ============================================
// Storyboard Engine — Registration
// ============================================

import { LayoutGrid } from 'lucide-react';
import type { EngineDefinition } from '@/engines/_types';
import { registerEngine } from '@/engines/_registry';
import StoryboardEngine from './StoryboardEngine';

const storyboardEngine: EngineDefinition = {
  id: 'storyboard',
  name: 'Storyboard',
  description: 'Visual panel sequences for planning scenes and shots',
  icon: LayoutGrid,
  category: 'planning',
  tables: {
    storyboards: 'id, projectId',
    storyboardPanels: 'id, storyboardId, projectId, order',
    storyboardConnectors: 'id, storyboardId, fromPanelId, toPanelId',
  },
  component: StoryboardEngine,
};

registerEngine(storyboardEngine);

export { storyboardEngine };
