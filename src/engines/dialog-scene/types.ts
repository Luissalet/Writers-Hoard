export interface Scene {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  order: number;
  setting?: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface DialogBlock {
  id: string;
  sceneId: string;
  projectId: string;
  type: 'dialog' | 'stage-direction' | 'note' | 'action';
  characterId?: string;
  characterName: string;
  characterColor: string;
  content: string;
  order: number;
  parenthetical?: string;
  createdAt: number;
  updatedAt: number;
}

export interface SceneCast {
  id: string;
  sceneId: string;
  characterId?: string;
  characterName: string;
  color: string;
  shortcut?: string;
}
