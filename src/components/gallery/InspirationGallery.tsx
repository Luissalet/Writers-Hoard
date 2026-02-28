import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Masonry from 'react-masonry-css';
import { Upload, Trash2, X, Image as ImageIcon, ZoomIn } from 'lucide-react';
import type { InspirationImage } from '@/types';
import { generateId } from '@/utils/idGenerator';
import TagInput from '@/components/common/TagInput';
import EmptyState from '@/components/common/EmptyState';

interface InspirationGalleryProps {
  projectId: string;
  images: InspirationImage[];
  onAdd: (image: InspirationImage) => void;
  onDelete: (id: string) => void;
}

export default function InspirationGallery({ projectId, images, onAdd, onDelete }: InspirationGalleryProps) {
  const [lightboxImage, setLightboxImage] = useState<InspirationImage | null>(null);
  const [filterTag, setFilterTag] = useState<string>('');
  const [uploadTags, setUploadTags] = useState<string[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        onAdd({
          id: generateId('img'),
          projectId,
          imageData,
          tags: [...uploadTags],
          notes: '',
          createdAt: Date.now(),
        });
      };
      reader.readAsDataURL(file);
    });
  }, [projectId, onAdd, uploadTags]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] },
  });

  const allTags = [...new Set(images.flatMap(img => img.tags))];
  const filtered = filterTag ? images.filter(img => img.tags.includes(filterTag)) : images;

  const breakpoints = { default: 4, 1100: 3, 700: 2, 500: 1 };

  return (
    <div className="space-y-4">
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
          title="No inspiration yet"
          message="Upload images to create your mood board and visual references."
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
