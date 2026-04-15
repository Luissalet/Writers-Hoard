import { Clock } from 'lucide-react';
import type { EngineDefinition } from '@/engines/_types';
import { registerEngine } from '@/engines/_registry';
import TimelineEngine from './TimelineEngine';

const timelineEngine: EngineDefinition = {
  id: 'timeline',
  name: 'Timeline',
  description: 'Chronological event sequencing with lanes and colors',
  icon: Clock,
  category: 'core',
  tables: {
    timelines: 'id, projectId',
    timelineEvents: 'id, projectId, timelineId, order',
  },
  component: TimelineEngine,
};

registerEngine(timelineEngine);

export { timelineEngine };
