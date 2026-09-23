import React, { useState, useRef } from 'react';
import { Upload, X, Star, Loader2, Video } from 'lucide-react';
import { uploadMediaToStorage, StorageBucket } from '../../lib/storage';
import { compressImage } from '../../lib/imageCompressor';
import { ProductImage, ProductImageType } from '../../types/database';
import { useToast } from './Toast';

interface MediaUploaderProps {
  bucket: StorageBucket;
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
  maxFiles?: number;
  acceptVideo?: boolean;
  folder?: string;
  allowTypeSelection?: boolean;
}

const IMAGE_TYPES: ProductImageType[] = ['Primary', 'Front', 'Side', 'Detail', 'Campaign', 'Lifestyle'];

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  bucket,
  images,
  onChange,
  maxFiles = 10,
  acceptVideo = false,
  folder = 'uploads',
  allowTypeSelection = true,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (images.length + files.length > maxFiles) {
      addToast({
        type: 'error',
        title: 'Limit Exceeded',
        message: `You can upload up to ${maxFiles} media items.`,
      });
      return;
    }

    setIsUploading(true);

    const newUploaded: ProductImage[] = [];

    for (let i = 0; i < files.length; i++) {
      let file = files[i];

      // Automatically compress images before upload to storage
      if (!file.type.startsWith('video/')) {
        try {
          file = await compressImage(file, {
            maxDimension: 1920,
            quality: 0.85,
            targetType: 'image/webp',
          });
        } catch (compressErr) {
          console.warn(`Compression skipped for ${file.name}:`, compressErr);
        }
      }

      const res = await uploadMediaToStorage({
        bucket,
        file,
        folder,
        maxSizeMB: file.type.startsWith('video/') ? 50 : 15,
      });

      if (res.error) {
        addToast({
          type: 'error',
          title: 'Upload Failed',
          message: `${file.name}: ${res.error}`,
        });
      } else if (res.url) {
        newUploaded.push({
          image_url: res.url,
          alt_text: file.name.split('.')[0].replace(/[-_]/g, ' '),
          image_type: images.length === 0 && newUploaded.length === 0 ? 'Primary' : 'Detail',
          sort_order: images.length + newUploaded.length + 1,
        });
      }
    }

    if (newUploaded.length > 0) {
      onChange([...images, ...newUploaded]);
      addToast({
        type: 'success',
        title: 'Upload Complete',
        message: `Successfully uploaded ${newUploaded.length} media file(s).`,
      });
    }

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDelete = (index: number) => {
    const updated = images.filter((_, idx) => idx !== index);
    if (updated.length > 0 && !updated.some((img) => img.image_type === 'Primary')) {
      updated[0].image_type = 'Primary';
    }
    onChange(updated);
  };

  const handleSetPrimary = (index: number) => {
    const updated = images.map((img, idx) => ({
      ...img,
      image_type: idx === index ? ('Primary' as ProductImageType) : img.image_type === 'Primary' ? ('Detail' as ProductImageType) : img.image_type,
    }));
    onChange(updated);
  };

  const handleTypeChange = (index: number, newType: ProductImageType) => {
    const updated = images.map((img, idx) => (idx === index ? { ...img, image_type: newType } : img));
    onChange(updated);
  };

  const handleAltChange = (index: number, alt: string) => {
    const updated = images.map((img, idx) => (idx === index ? { ...img, alt_text: alt } : img));
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Drop Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          dragOver
            ? 'border-neutral-900 bg-neutral-50'
            : 'border-neutral-300 hover:border-neutral-400 bg-white'
        } ${isUploading ? 'opacity-60 cursor-wait' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={maxFiles > 1}
          accept={acceptVideo ? 'image/*,.heic,.heif,video/mp4,video/webm' : 'image/*,.heic,.heif'}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          disabled={isUploading}
        />

        <div className="flex flex-col items-center justify-center gap-2 text-neutral-600">
          <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600">
            {isUploading ? (
              <Loader2 size={20} className="animate-spin text-neutral-900" />
            ) : (
              <Upload size={18} />
            )}
          </div>

          <div>
            <span className="text-xs font-semibold text-neutral-900">
              {isUploading ? 'Memproses & mengunggah media...' : 'Click to upload or drag & drop'}
            </span>
            <p className="text-[11px] text-neutral-400 mt-0.5 font-light">
              {acceptVideo
                ? 'PNG, JPG, WebP, HEIC (otomatis dikompres) atau MP4 video'
                : 'PNG, JPG, WebP, HEIC (otomatis dikompres ke WebP hingga 15MB)'}
            </p>
          </div>
        </div>
      </div>

      {/* Uploaded Gallery Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((img, idx) => {
            const isVid = img.image_url.endsWith('.mp4') || img.image_url.endsWith('.webm');
            const isPrimary = img.image_type === 'Primary';

            return (
              <div
                key={idx}
                className={`relative group bg-neutral-50 rounded-xl border overflow-hidden transition-all ${
                  isPrimary ? 'border-neutral-900 ring-1 ring-neutral-900' : 'border-neutral-200'
                }`}
              >
                {/* Media Preview */}
                <div className="aspect-[4/3] bg-neutral-100 relative overflow-hidden flex items-center justify-center">
                  {isVid ? (
                    <video
                      src={img.image_url}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                    />
                  ) : (
                    <img
                      src={img.image_url}
                      alt={img.alt_text || 'Media thumbnail'}
                      className="w-full h-full object-contain p-2"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  )}

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex items-center gap-1">
                    {isPrimary && (
                      <span className="bg-neutral-900 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                        <Star size={10} fill="currentColor" /> Primary
                      </span>
                    )}
                    {isVid && (
                      <span className="bg-black/70 backdrop-blur-xs text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Video size={10} /> Video
                      </span>
                    )}
                  </div>

                  {/* Actions Overlay */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!isPrimary && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetPrimary(idx);
                        }}
                        className="p-1 rounded-md bg-white/90 text-neutral-700 hover:text-neutral-900 shadow-xs text-[10px] font-medium transition-colors"
                        title="Set as primary thumbnail"
                      >
                        <Star size={13} />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(idx);
                      }}
                      className="p-1 rounded-md bg-rose-600 text-white hover:bg-rose-700 shadow-xs transition-colors"
                      title="Remove image"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>

                {/* Details Footer */}
                {allowTypeSelection && (
                  <div className="p-2.5 bg-white border-t border-neutral-200 space-y-1.5">
                    <select
                      value={img.image_type}
                      onChange={(e) => handleTypeChange(idx, e.target.value as ProductImageType)}
                      className="w-full py-1 px-2 text-[11px] font-medium bg-neutral-50 rounded border border-neutral-200 text-neutral-700 focus:outline-none focus:border-neutral-900"
                    >
                      {IMAGE_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      value={img.alt_text || ''}
                      onChange={(e) => handleAltChange(idx, e.target.value)}
                      placeholder="Alt text / description"
                      className="w-full py-1 px-2 text-[10px] bg-neutral-50 rounded border border-neutral-200 text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
