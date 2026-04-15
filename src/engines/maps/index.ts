import { Map } from 'lucide-react';
import type { EngineDefinition } from '@/engines/_types';
import { registerEngine } from '@/engines/_registry';
import MapsEngine from './MapsEngine';

const mapsEngine: EngineDefinition = {
  id: 'maps',
  name: 'Maps',
  description: 'World maps with pin placement',
  icon: Map,
  category: 'core',
  tables: {
    worldMaps: 'id, projectId',
    mapPins: 'id, projectId, mapId',
  },
  component: MapsEngine,
};

registerEngine(mapsEngine);

export { mapsEngine };
