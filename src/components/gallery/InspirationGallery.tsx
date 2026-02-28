import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Masonry from 'react-masonry-css';
import { Upload, Trash2, X, Image as ImageIcon, ZoomIn, FolderPlus, Folder, ChevronRight } from 'lucide-react';
import type { InspirationImage, ImageCollection } from '@/types';
import { generateId } from '@/utils/idGenerator';
import TagInput from '@/components/common/TagInput';
import EmptyState from '@/components/common/EmptyState';

interface InspirationGalleryProps {
  projectId: string;
  images: InspirationImage[];
  collections: ImageCollection[];
  onAdd: (image: InspirationImage) => void;
  onEditImage: (id: string, changes: Partial<InspirationImage>) => void;
  onDelete: (id: string) => void;
  onAddCollection: (collection: ImageCollection) => void;
  onDeleteCollection: (id: string) => void;
}

export default function InspirationGallery({
  projectId,
  images,
  collections,
  onAdd,
  onEditImage,
  onDelete,
  onAddCollection,
  onDeleteCollection,
}: InspirationGalleryProps) {
  const [lightboxImage, setLightboxImage] = useState<InspirationImage | null>(null);
  const [filterTag, setFilterTag] = useState<string>('');
  const [uploadTags, setUploadTags] = useState<string[]>([]);
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
  const [showNewAlbum, setShowNewAlbum] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        onAdd({
          id: generateId('img'),
          projectId,
          collectionId: activeCollectionId || undefined,
          imageData,
          tags: [...uploadTags],
          notes: '',
          createdAt: Date.now(),
        });
      };
      reader.readAsDataURL(file);
    });
  }, [projectId, onAdd, uploadTags, activeCollectionId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] },
  });

  const handleCreateAlbum = () => {
    if (!newAlbumName.trim()) return;
    onAddCollection({
      id: generateId('col'),
      projectId,
      title: newAlbumName.trim(),
      createdAt: Date.now(),
    });
    setNewAlbumName('');
    setShowNewAlbum(false);
  };

  const handleMoveToAlbum = (imageId: string, collectionId: string | null) => {
    onEditImage(imageId, { collectionId: collectionId || undefined });
  };

  // Filter images
  const allTags = [...new Set(images.flatMap(img => img.tags))];
  const filteredByCollection = activeCollectionId
    ? images.filter(img => img.collectionId === activeCollectionId)
    : images;
  const filtered = filterTag
    ? filteredByCollection.filter(img => img.tags.includes(filterTag))
    : filteredByCollection;

  const breakpoints = { default: 4, 1100: 3, 700: 2, 500: 1 };

  return (
    <div className="space-y-4">
      {/* Album tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveCollectionId(null)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition ${
            !activeCollectionId
              ? 'bg-accent-gold/15 text-accent-gold font-semibold'
              : 'text-text-muted hover:text-text-primary hover:bg-elevated'
          }`}
        >
          <ImageIcon size={14} />
          All Images
          <span className="text-xs opacity-60 ml-1">({images.length})</span>
        </button>

        {collections.map(col => {
          const count = images.filter(img => img.collectionId === col.id).length;
          return (
            <div key={col.id} className="flex items-center group">
              <button
                onClick={() => setActiveCollectionId(col.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition ${
                  activeCollectionId === col.id
                    ? 'bg-accent-plum/15 text-accent-plum-light font-semibold'
                    : 'text-text-muted hover:text-text-primary hover:bg-elevated'
                }`}
              >
                <Folder size={14} />
                {col.title}
                <span className="text-xs opacity-60 ml-1">({count})</span>
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete album "${col.title}"? Images will be moved to All Images.`)) {
                    // Move images to no collection before deleting
                    images.filter(img => img.collectionId === col.id).forEach(img => {
                      onEditImage(img.id, { collectionId: undefined });
                    });
                    onDeleteCollection(col.id);
                    if (activeCollectionId === col.id) setActiveCollectionId(null);
                  }
                }}
                className="p-1 text-text-dim opacity-0 group-hover:opacity-100 hover:text-danger transition"
                title="Delete album"
              >
                <X size={12} />
              </button>
            </div>
          );
        })}

        {showNewAlbum ? (
          <div className="flex items-center gap-1">
            <input
              value={newAlbumName}
              onChange={(e) => setNewAlbumName(e.target.value)}
              placeholder="Album name..."
              className="px-2 py-1 bg-elevated border border-border rounded text-sm text-text-primary outline-none focus:border-accent-gold w-32"
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreateAlbum(); if (e.key === 'Escape') setShowNewAlbum(false); }}
            />
            <button onClick={handleCreateAlbum} className="p-1 text-accent-gold hover:text-accent-amber transition">
              <ChevronRight size={16} />
            </button>
            <button onClick={() => setShowNewAlbum(false)} className="p-1 text-text-muted hover:text-text-primary transition">
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowNewAlbum(true)}
            className="flex items-center gap-1 px-2 py-1.5 text-text-muted hover:text-accent-gold transition text-sm"
          >
            <FolderPlus size={14} />
            New Album
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div {...getRootProps()} className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition border-2 border-dashed ${
          isDragActive ? 'border-accent-gold bg-accent-gold/10 text-accent-gold' : 'border-border text-text-muted hover:border-accent-gold/50 hover:text-text-primary'
        }`}>
          <input {...getInputProps()} />
          <Upload size={16} />
          <span className="text-sm">{isDragActive ? 'Drop images here...' : 'Upload Images'}</span>
        </div>

        {allTags.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            <button
              onClick={() => setFilterTag('')}
              className={`px-2.5 py-1 rounded text-xs transition ${!filterTag ? 'bg-accent-gold/20 text-accent-gold' : 'text-text-muted hover:text-text-primary'}`}
            >
              All
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setFilterTag(tag)}
                className={`px-2.5 py-1 rounded text-xs transition ${filterTag === tag ? 'bg-accent-plum/20 text-accent-plum-light' : 'text-text-muted hover:text-text-primary'}`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Upload tags */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-text-muted">Tags for uploads:</span>
        <div className="flex-1">
          <TagInput tags={uploadTags} onChange={setUploadTags} placeholder="Tag new uploads..." />
        </div>
      </div>

      {/* Gallery */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<ImageIcon size={40} />}
          title={activeCollectionId ? "Album is empty" : "No inspiration yet"}
          message={activeCollectionId ? "Upload images or move them here from another album." : "Upload images to create your mood board and visual references."}
          action={{ label: 'Upload Images', onClick: () => {} }}
        />
      ) : (
        <Masonry
          breakpointCols={breakpoints}
          className="flex gap-3 w-auto"
          columnClassName="flex flex-col gap-3"
        >
          {filtered.map(image => (
            <div key={image.id} className="group relative rounded-lg overflow-hidden border border-border hover:border-accent-gold/40 transition">
              <img
                src={image.imageData}
                alt=""
                className="w-full block cursor-pointer"
                onClick={() => setLightboxImage(image)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition">
                <div className="absolute bottom-0 left-0 right-0 p-2 flex items-end justify-between">
                  <div className="flex gap-1 flex-wrap">
                    {image.tags.map(tag => (
                      <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-black/50 rounded text-white/80">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    {/* Move to album dropdown */}
                    {collections.length > 0 && (
                      <select
                        value={image.collectionId || ''}
                        onChange={(e) => handleMoveToAlbum(image.id, e.target.value || null)}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[10px] bg-black/50 text-white/80 rounded px-1 py-0.5 outline-none border-0 max-w-[80px]"
                        title="Move to album"
                      >
                        <option value="">No album</option>
                        {collections.map(col => (
                          <option key={col.id} value={col.id}>{col.title}</option>
                        ))}
                      </select>
                    )}
                    <button
                      onClick={() => setLightboxImage(image)}
                      className="p-1.5 bg-black/50 rounded hover:bg-black/70 transition"
                    >
                      <ZoomIn size={14} className="text-white" />
                    </button>
                    <button
                      onClick={() => onDelete(image.id)}
                      className="p-1.5 bg-black/50 rounded hover:bg-danger/70 transition"
                    >
                      <Trash2 size={14} className="text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Masonry>
      )}

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setLightboxImage(null)}
        >
          <button className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition">
            <X size={24} className="text-white" />
          </button>
          <img
            src={lightboxImage.imageData}
            alt=""
            className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
