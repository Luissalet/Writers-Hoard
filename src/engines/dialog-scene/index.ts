import { MessageSquare } from 'lucide-react';
import type { EngineDefinition } from '@/engines/_types';
import { registerEngine } from '@/engines/_registry';
import DialogSceneEngine from './components/DialogSceneEngine';

const dialogSceneEngine: EngineDefinition = {
  id: 'dialog-scene',
  name: 'Dialog / Scenes',
  description: 'Create scenes with character dialog and stage directions',
  icon: MessageSquare,
  category: 'creative',
  tables: {
    scenes: 'id, projectId, order',
    dialogBlocks: 'id, sceneId, projectId, order',
    sceneCasts: 'id, sceneId',
  },
  component: DialogSceneEngine,
};

registerEngine(dialogSceneEngine);

export { dialogSceneEngine };
