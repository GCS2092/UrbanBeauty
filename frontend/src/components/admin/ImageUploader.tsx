'use client';

import { useState, useRef } from 'react';
import { 
  PhotoIcon, 
  XMarkIcon, 
  LinkIcon, 
  StarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import api from '@/lib/api';

interface ImageUploaderProps {
  images: Array<{ url: string; type?: 'URL' | 'UPLOADED' }>;
  onChange: (images: Array<{ url: string; type: 'URL' | 'UPLOADED' }>) => void;
  maxImages?: number;
}

export default function ImageUploader({ images, onChange, maxImages = 5 }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);
  const [urlMode, setUrlMode] = useState<Record<number, boolean>>({});
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, replaceIndex?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier (accepte tous les types d'images courants)
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif'];
    if (!file.type.startsWith('image/') && !validTypes.includes(file.type.toLowerCase())) {
      alert('Seules les images sont autorisées (JPG, PNG, GIF, WEBP, HEIC)');
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

      const response = await api.post(
        '/api/upload/image',
        formData
      );

      const newImage = { url: response.data.url, type: 'UPLOADED' as const };

      if (replaceIndex !== undefined && replaceIndex !== null) {
        // Remplacer l'image existante
        const newImages = [...images.map(img => ({ url: img.url, type: img.type || 'URL' as const }))];
        newImages[replaceIndex] = newImage;
        onChange(newImages);
        setReplacingIndex(null);
      } else {
        // Ajouter une nouvelle image
        onChange([
          ...images.map(img => ({ url: img.url, type: img.type || 'URL' as const })),
          newImage,
        ]);
      }

      // Réinitialiser les inputs
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (replaceInputRef.current) replaceInputRef.current.value = '';
    } catch (error: any) {
      console.error('Erreur upload:', error);
      alert(error?.response?.data?.message || 'Erreur lors de l\'upload de l\'image. Vérifiez votre connexion.');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlAdd = (index: number, url: string) => {
    if (!url.trim()) return;

    const newImages = [...images.map(img => ({ url: img.url, type: img.type || 'URL' as const }))];
    if (index >= newImages.length) {
      newImages.push({ url: url.trim(), type: 'URL' });
    } else {
      newImages[index] = { url: url.trim(), type: 'URL' };
    }
    onChange(newImages);
    setUrlMode({ ...urlMode, [index]: false });
  };

  // Supprimer avec confirmation inline (sans confirm() qui bloque sur mobile)
  const handleRemoveClick = (index: number) => {
    setDeleteConfirmIndex(index);
  };

  const handleRemoveConfirm = (index: number) => {
    const newImages = images.filter((_, i) => i !== index).map(img => ({ url: img.url, type: img.type || 'URL' as const }));
    onChange(newImages);
    setDeleteConfirmIndex(null);
  };

  // Définir comme image principale (déplacer en première position)
  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    
    const newImages = [...images.map(img => ({ url: img.url, type: img.type || 'URL' as const }))];
    const [movedImage] = newImages.splice(index, 1);
    newImages.unshift(movedImage);
    onChange(newImages);
  };

  // Déplacer vers le haut
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    
    const newImages = [...images.map(img => ({ url: img.url, type: img.type || 'URL' as const }))];
    [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
    onChange(newImages);
  };

  // Déplacer vers le bas
  const handleMoveDown = (index: number) => {
    if (index === images.length - 1) return;
    
    const newImages = [...images.map(img => ({ url: img.url, type: img.type || 'URL' as const }))];
    [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
    onChange(newImages);
  };

  // Remplacer une image
  const handleReplace = (index: number) => {
    setReplacingIndex(index);
    // Timeout pour s'assurer que le state est mis à jour avant le click
    setTimeout(() => {
      replaceInputRef.current?.click();
    }, 100);
  };

  return (
    <div className="space-y-4">
      {/* Input caché pour le remplacement */}
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/heic,image/heif"
        onChange={(e) => handleFileUpload(e, replacingIndex ?? undefined)}
        className="hidden"
        disabled={uploading}
      />

      {/* Images existantes */}
      {images.length > 0 && (
        <div className="space-y-3">
          {images.map((image, index) => (
            <div 
              key={`${image.url}-${index}`}
              className={`relative rounded-lg border-2 overflow-hidden ${
                index === 0 ? 'border-pink-500 bg-pink-50' : 'border-gray-200 bg-white'
              }`}
            >
              {/* Modal de confirmation de suppression */}
              {deleteConfirmIndex === index && (
                <div className="absolute inset-0 bg-black/70 z-10 flex items-center justify-center p-4">
                  <div className="bg-white rounded-lg p-4 max-w-xs w-full text-center">
                    <p className="text-sm font-medium text-gray-900 mb-3">Supprimer cette image ?</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmIndex(null)}
                        className="flex-1 px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg active:bg-gray-200"
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveConfirm(index)}
                        className="flex-1 px-3 py-2 text-sm text-white bg-red-600 rounded-lg active:bg-red-700"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 p-3">
                {/* Aperçu de l'image */}
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
                  <img
                    src={image.url}
                    alt={`Image ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f3f4f6" width="200" height="200"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EErreur%3C/text%3E%3C/svg%3E';
                    }}
                  />
                  {index === 0 && (
                    <div className="absolute -top-1 -left-1 bg-pink-500 text-white text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                      <StarIconSolid className="h-2.5 w-2.5" />
                      <span className="hidden sm:inline">Principal</span>
                    </div>
                  )}
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    Image {index + 1} {index === 0 && <span className="sm:hidden text-pink-600">(Principal)</span>}
                  </p>
                  <p className="text-xs text-gray-500">
                    {image.type === 'UPLOADED' ? 'Uploadée' : 'URL externe'}
                  </p>
                </div>

                {/* Actions - Boutons plus grands pour mobile */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {/* Définir comme principal */}
                  {index !== 0 && (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(index)}
                      className="p-2.5 sm:p-2 text-gray-500 hover:text-pink-600 active:text-pink-700 hover:bg-pink-100 active:bg-pink-200 rounded-lg transition-colors touch-manipulation"
                      title="Définir comme image principale"
                    >
                      <StarIcon className="h-5 w-5" />
                    </button>
                  )}

                  {/* Déplacer vers le haut */}
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => handleMoveUp(index)}
                      className="p-2.5 sm:p-2 text-gray-500 hover:text-blue-600 active:text-blue-700 hover:bg-blue-100 active:bg-blue-200 rounded-lg transition-colors touch-manipulation"
                      title="Déplacer vers le haut"
                    >
                      <ArrowUpIcon className="h-5 w-5" />
                    </button>
                  )}

                  {/* Déplacer vers le bas */}
                  {index < images.length - 1 && (
                    <button
                      type="button"
                      onClick={() => handleMoveDown(index)}
                      className="p-2.5 sm:p-2 text-gray-500 hover:text-blue-600 active:text-blue-700 hover:bg-blue-100 active:bg-blue-200 rounded-lg transition-colors touch-manipulation"
                      title="Déplacer vers le bas"
                    >
                      <ArrowDownIcon className="h-5 w-5" />
                    </button>
                  )}

                  {/* Remplacer */}
                  <button
                    type="button"
                    onClick={() => handleReplace(index)}
                    disabled={uploading}
                    className="p-2.5 sm:p-2 text-gray-500 hover:text-orange-600 active:text-orange-700 hover:bg-orange-100 active:bg-orange-200 rounded-lg transition-colors disabled:opacity-50 touch-manipulation"
                    title="Remplacer l'image"
                  >
                    <ArrowPathIcon className="h-5 w-5" />
                  </button>

                  {/* Supprimer */}
                  <button
                    type="button"
                    onClick={() => handleRemoveClick(index)}
                    className="p-2.5 sm:p-2 text-gray-500 hover:text-red-600 active:text-red-700 hover:bg-red-100 active:bg-red-200 rounded-lg transition-colors touch-manipulation"
                    title="Supprimer l'image"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Boutons d'ajout */}
      {images.length < maxImages && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Upload fichier - Plus grand sur mobile */}
          <label className={`
            flex flex-col items-center justify-center p-6 sm:p-4 rounded-lg border-2 border-dashed 
            cursor-pointer transition-colors touch-manipulation
            ${uploading 
              ? 'border-gray-300 bg-gray-50 cursor-wait' 
              : 'border-gray-300 hover:border-pink-500 active:border-pink-600 hover:bg-pink-50 active:bg-pink-100'
            }
          `}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/heic,image/heif"
              onChange={(e) => handleFileUpload(e)}
              className="hidden"
              disabled={uploading}
            />
            {uploading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-600 mx-auto mb-3"></div>
                <p className="text-sm text-gray-600">Upload en cours...</p>
              </div>
            ) : (
              <>
                <PhotoIcon className="h-12 w-12 sm:h-10 sm:w-10 text-gray-400 mb-3" />
                <p className="text-sm font-medium text-gray-700">Choisir une image</p>
                <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF, WEBP (max 5MB)</p>
              </>
            )}
          </label>

          {/* Ajouter URL */}
          {!urlMode[images.length] ? (
            <button
              type="button"
              onClick={() => setUrlMode({ ...urlMode, [images.length]: true })}
              className="flex flex-col items-center justify-center p-6 sm:p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-pink-500 active:border-pink-600 hover:bg-pink-50 active:bg-pink-100 transition-colors touch-manipulation"
            >
              <LinkIcon className="h-12 w-12 sm:h-10 sm:w-10 text-gray-400 mb-3" />
              <p className="text-sm font-medium text-gray-700">Ajouter une URL</p>
              <p className="text-xs text-gray-500 mt-1">Lien vers une image existante</p>
            </button>
          ) : (
            <div className="flex flex-col p-4 rounded-lg border-2 border-pink-500 bg-pink-50">
              <label className="text-sm font-medium text-gray-700 mb-2">URL de l'image</label>
              <input
                type="url"
                placeholder="https://exemple.com/image.jpg"
                className="w-full text-sm px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => setUrlMode({ ...urlMode, [images.length]: false })}
                  className="flex-1 px-3 py-3 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg active:bg-gray-100 transition-colors touch-manipulation"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    const input = e.currentTarget.parentElement?.previousElementSibling as HTMLInputElement;
                    if (input?.value.trim()) {
                      handleUrlAdd(images.length, input.value);
                    }
                  }}
                  className="flex-1 px-3 py-3 text-sm text-white bg-pink-600 rounded-lg active:bg-pink-700 transition-colors touch-manipulation"
                >
                  Ajouter
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info */}
      <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
        <p className="font-medium text-gray-700 mb-1">Conseils</p>
        <ul className="space-y-0.5 text-xs">
          <li>• La première image sera affichée en couverture</li>
          <li>• Utilisez les flèches pour réorganiser</li>
          <li>• {images.length}/{maxImages} images</li>
        </ul>
      </div>
    </div>
  );
}