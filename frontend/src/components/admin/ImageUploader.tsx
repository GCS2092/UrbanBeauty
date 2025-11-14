'use client';

import { useState, useRef } from 'react';
import { PhotoIcon, XMarkIcon, LinkIcon } from '@heroicons/react/24/outline';
import api from '@/lib/api';

interface ImageUploaderProps {
  images: Array<{ url: string; type?: 'URL' | 'UPLOADED' }>;
  onChange: (images: Array<{ url: string; type: 'URL' | 'UPLOADED' }>) => void;
  maxImages?: number;
}

export default function ImageUploader({ images, onChange, maxImages = 5 }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [urlMode, setUrlMode] = useState<Record<number, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.match(/^image\/(jpg|jpeg|png|gif|webp)$/)) {
      alert('Seules les images sont autorisées (JPG, PNG, GIF, WEBP)');
      return;
    }

    // Vérifier la taille (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('L\'image ne doit pas dépasser 5MB');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post<{ url: string; publicId: string }>(
        '/api/upload/image',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      onChange([
        ...images,
        {
          url: response.data.url,
          type: 'UPLOADED',
        },
      ]);

      // Réinitialiser l'input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Erreur lors de l\'upload de l\'image');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlAdd = (index: number, url: string) => {
    if (!url.trim()) return;

    const newImages = [...images];
    if (index >= newImages.length) {
      newImages.push({ url: url.trim(), type: 'URL' });
    } else {
      newImages[index] = { url: url.trim(), type: 'URL' };
    }
    onChange(newImages);
    setUrlMode({ ...urlMode, [index]: false });
  };

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Images *
      </label>

      {/* Images existantes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative group">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
              <img
                src={image.url}
                alt={`Image ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f3f4f6" width="200" height="200"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
            <div className="absolute bottom-1 left-1 px-2 py-1 bg-black/50 text-white text-xs rounded">
              {image.type === 'UPLOADED' ? 'Upload' : 'URL'}
            </div>
          </div>
        ))}

        {/* Boutons d'ajout */}
        {images.length < maxImages && (
          <>
            {/* Upload fichier */}
            <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-pink-500 hover:bg-pink-50 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
              {uploading ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto mb-2"></div>
                  <p className="text-xs text-gray-600">Upload...</p>
                </div>
              ) : (
                <>
                  <PhotoIcon className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-xs text-gray-600 text-center px-2">Upload</p>
                </>
              )}
            </label>

            {/* Ajouter URL */}
            {!urlMode[images.length] ? (
              <button
                type="button"
                onClick={() => setUrlMode({ ...urlMode, [images.length]: true })}
                className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center hover:border-pink-500 hover:bg-pink-50 transition-colors"
              >
                <LinkIcon className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-xs text-gray-600 text-center px-2">URL</p>
              </button>
            ) : (
              <div className="aspect-square rounded-lg border-2 border-pink-500 p-2 flex flex-col">
                <input
                  type="url"
                  placeholder="https://..."
                  className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  onBlur={(e) => {
                    if (e.target.value.trim()) {
                      handleUrlAdd(images.length, e.target.value);
                    } else {
                      setUrlMode({ ...urlMode, [images.length]: false });
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (e.currentTarget.value.trim()) {
                        handleUrlAdd(images.length, e.currentTarget.value);
                      }
                    }
                    if (e.key === 'Escape') {
                      setUrlMode({ ...urlMode, [images.length]: false });
                    }
                  }}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setUrlMode({ ...urlMode, [images.length]: false })}
                  className="mt-2 text-xs text-gray-600 hover:text-gray-800"
                >
                  Annuler
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <p className="text-xs text-gray-500">
        {images.length === 0 && 'Ajoutez au moins une image. '}
        Vous pouvez uploader des fichiers (JPG, PNG, GIF, WEBP, max 5MB) ou utiliser des URLs.
        Maximum {maxImages} images.
      </p>
    </div>
  );
}

