import { Video } from 'lucide-react';
import type { EngineDefinition } from '@/engines/_types';
import { registerEngine } from '@/engines/_registry';
import VideoPlannerEngine from './components/VideoPlannerEngine';

const videoPlannerEngine: EngineDefinition = {
  id: 'video-planner',
  name: 'Video Planner',
  description: 'Plan video segments with script, visuals, and teleprompter',
  icon: Video,
  category: 'planning',
  tables: {
    videoPlans: 'id, projectId',
    videoSegments: 'id, videoPlanId, projectId, order',
  },
  component: VideoPlannerEngine,
};

registerEngine(videoPlannerEngine);

export { videoPlannerEngine };
