import { useMemo } from 'react';
import type { EngineComponentProps } from '@/engines/_types';
import { useCodexEntries } from '@/hooks/useCodexEntries';
import { useInspirationImages } from '@/hooks/useGallery';
import CodexEntryList from '@/components/codex/CodexEntryList';

export default function CodexEngine({ projectId }: EngineComponentProps) {
  const { entries, loading: entriesLoading, addEntry, editEntry, removeEntry } = useCodexEntries(projectId);
  const { images, loading: imagesLoading } = useInspirationImages(projectId);

  const loading = useMemo(() => entriesLoading || imagesLoading, [entriesLoading, imagesLoading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-accent-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <CodexEntryList
      projectId={projectId}
      entries={entries}
      images={images}
      onAdd={addEntry}
      onEdit={editEntry}
      onDelete={removeEntry}
    />
  );
}
