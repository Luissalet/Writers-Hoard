import { useState, useEffect } from 'react';
import type { EngineComponentProps } from '@/engines/_types';
import { useScenes } from '../hooks';
import SceneListView from './SceneListView';
import SceneEditor from './SceneEditor';

export default function DialogSceneEngine({ projectId }: EngineComponentProps) {
  const { scenes, loading, addScene, editScene, removeScene, reorder } =
    useScenes(projectId);
  const [activeSceneId, setActiveSceneId] = useState<string>('');

  // Auto-select first scene if available
  useEffect(() => {
    if (scenes.length > 0 && !activeSceneId) {
      setActiveSceneId(scenes[0].id);
    }
  }, [scenes, activeSceneId]);

  if (loading && scenes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-deep">
        <div className="w-8 h-8 border-2 border-accent-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeScene = scenes.find((s) => s.id === activeSceneId);

  return (
    <div className="h-full">
      {activeScene ? (
        <SceneEditor
          scene={activeScene}
          onUpdateScene={(changes) => editScene(activeScene.id, changes)}
          onBack={() => setActiveSceneId('')}
        />
      ) : (
        <SceneListView
          scenes={scenes}
          onSelectScene={setActiveSceneId}
          onCreateScene={(scene) =>
            addScene({ ...scene, projectId })
          }
          onDeleteScene={removeScene}
          onReorderScenes={reorder}
        />
      )}
    </div>
  );
}
