import { useMemo } from 'react';
import type { EngineComponentProps } from '@/engines/_types';
import { useInspirationImages, useImageCollections } from '@/hooks/useGallery';
import { useCodexEntries } from '@/hooks/useCodexEntries';
import InspirationGallery from '@/components/gallery/InspirationGallery';

export default function GalleryEngine({ projectId }: EngineComponentProps) {
  const { images, addImage, editImage, removeImage } = useInspirationImages(projectId);
  const { collections, addCollection, removeCollection } = useImageCollections(projectId);
  const { entries, loading: entriesLoading } = useCodexEntries(projectId);

  const loading = useMemo(() => entriesLoading, [entriesLoading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-accent-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <InspirationGallery
      projectId={projectId}
      images={images}
      collections={collections}
      codexEntries={entries}
      onAdd={addImage}
      onEditImage={editImage}
      onDelete={removeImage}
      onAddCollection={addCollection}
      onDeleteCollection={removeCollection}
    />
  );
}
