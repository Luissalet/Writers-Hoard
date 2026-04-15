import { Network } from 'lucide-react';
import type { EngineDefinition } from '@/engines/_types';
import { registerEngine } from '@/engines/_registry';
import YarnBoardEngine from './YarnBoardEngine';

const yarnBoardEngine: EngineDefinition = {
  id: 'yarn-board',
  name: 'Yarn Board',
  description: 'Conceptual maps with nodes and connections',
  icon: Network,
  category: 'core',
  tables: {
    yarnBoards: 'id, projectId',
    yarnNodes: 'id, projectId, boardId',
    yarnEdges: 'id, boardId, sourceId, targetId',
  },
  component: YarnBoardEngine,
};

registerEngine(yarnBoardEngine);

export { yarnBoardEngine };
