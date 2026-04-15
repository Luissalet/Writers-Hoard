import { useMemo } from 'react';
import type { EngineComponentProps } from '@/engines/_types';
import { useExternalLinks } from '@/hooks/useExternalLinks';
import ExternalLinksView from '@/components/links/ExternalLinksView';

export default function LinksEngine({ projectId }: EngineComponentProps) {
  const { links, addLink, removeLink, loading } = useExternalLinks(projectId);

  const isLoading = useMemo(() => loading, [loading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-accent-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <ExternalLinksView projectId={projectId} links={links} onAdd={addLink} onDelete={removeLink} />;
}
