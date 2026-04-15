// ============================================
// Brainstorm Engine — Registration
// ============================================

import { Lightbulb } from 'lucide-react';
import type { EngineDefinition } from '@/engines/_types';
import { registerEngine } from '@/engines/_registry';
import BrainstormEngine from './components/BrainstormEngine';

const brainstormEngine: EngineDefinition = {
  id: 'brainstorm',
  name: 'Brainstorm',
  description: 'Freeform canvas to mix ideas from every engine',
  icon: Lightbulb,
  category: 'creative',
  tables: {
    brainstormBoards: 'id, projectId',
    brainstormItems: 'id, boardId, projectId, type',
    brainstormConnections: 'id, boardId, sourceId, targetId',
  },
  component: BrainstormEngine,
};

registerEngine(brainstormEngine);

export { brainstormEngine };
