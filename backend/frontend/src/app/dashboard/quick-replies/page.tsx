'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import {
  useQuickReplies,
  useCreateQuickReply,
  useUpdateQuickReply,
  useDeleteQuickReply,
  useCreateDefaultQuickReplies,
  useReorderQuickReplies,
} from '@/hooks/useQuickReplies';
import { useNotifications } from '@/components/admin/NotificationProvider';
import { QuickReply } from '@/services/quick-replies.service';

function QuickRepliesContent() {
  const { data: quickReplies = [], isLoading } = useQuickReplies();
  const { mutate: createReply, isPending: isCreating } = useCreateQuickReply();
  const { mutate: updateReply, isPending: isUpdating } = useUpdateQuickReply();
  const { mutate: deleteReply, isPending: isDeleting } = useDeleteQuickReply();
  const { mutate: createDefaults, isPending: isCreatingDefaults } = useCreateDefaultQuickReplies();
  const { mutate: reorder } = useReorderQuickReplies();
  const notifications = useNotifications();

  const [showForm, setShowForm] = useState(false);
  const [editingReply, setEditingReply] = useState<QuickReply | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '', shortcut: '' });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      notifications.warning('Erreur', 'Le titre et le contenu sont requis');
      return;
    }

    if (editingReply) {
      updateReply(
        {
          id: editingReply.id,
          dto: {
            title: formData.title,
            content: formData.content,
            shortcut: formData.shortcut || undefined,
          },
        },
        {
          onSuccess: () => {
            notifications.success('Modifié', 'Réponse rapide mise à jour');
            resetForm();
          },
          onError: (error: any) => {
            notifications.error('Erreur', error.response?.data?.message || 'Erreur lors de la modification');
          },
        }
      );
    } else {
      createReply(
        {
          title: formData.title,
          content: formData.content,
          shortcut: formData.shortcut || undefined,
        },
        {
          onSuccess: () => {
            notifications.success('Créé', 'Nouvelle réponse rapide ajoutée');
            resetForm();
          },
          onError: (error: any) => {
            notifications.error('Erreur', error.response?.data?.message || 'Erreur lors de la création');
          },
        }
      );
    }
  };

  const resetForm = () => {
    setFormData({ title: '', content: '', shortcut: '' });
    setEditingReply(null);
    setShowForm(false);
  };

  const handleEdit = (reply: QuickReply) => {
    setEditingReply(reply);
    setFormData({
      title: reply.title,
      content: reply.content,
      shortcut: reply.shortcut || '',
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    deleteReply(id, {
      onSuccess: () => {
        notifications.success('Supprimé', 'Réponse rapide supprimée');
        setDeleteConfirm(null);
      },
    });
  };

  const handleCreateDefaults = () => {
    createDefaults(undefined, {
      onSuccess: () => {
        notifications.success('Créé', 'Réponses par défaut ajoutées');
      },
    });
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...quickReplies];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    reorder(newOrder.map((r) => r.id));
  };

  const handleMoveDown = (index: number) => {
    if (index === quickReplies.length - 1) return;
    const newOrder = [...quickReplies];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    reorder(newOrder.map((r) => r.id));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-pink-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white sticky top-0 z-40 border-b border-gray-100">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="p-2 -ml-2 rounded-lg hover:bg-gray-100">
                <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <ChatBubbleLeftRightIcon className="h-5 w-5 text-purple-600" />
                  Réponses Rapides
                </h1>
                <p className="text-xs text-gray-500">{quickReplies.length}/20 réponses</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              disabled={quickReplies.length >= 20}
              className="p-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="px-4 py-4 space-y-4">
        {/* Message si vide */}
        {quickReplies.length === 0 && !showForm && (
          <div className="bg-white rounded-2xl p-8 text-center">
            <SparklesIcon className="h-12 w-12 mx-auto text-purple-300 mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Aucune réponse rapide</h2>
            <p className="text-sm text-gray-500 mb-6">
              Créez des réponses prédéfinies pour gagner du temps dans vos conversations
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleCreateDefaults}
                disabled={isCreatingDefaults}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm"
              >
                {isCreatingDefaults ? '...' : 'Ajouter des exemples'}
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-xl font-medium text-sm"
              >
                Créer une réponse
              </button>
            </div>
          </div>
        )}

        {/* Formulaire */}
        {showForm && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">
              {editingReply ? 'Modifier la réponse' : 'Nouvelle réponse rapide'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Salutations, Tarifs..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contenu du message *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Le message qui sera envoyé..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Raccourci (optionnel)
                </label>
                <input
                  type="text"
                  value={formData.shortcut}
                  onChange={(e) => setFormData({ ...formData, shortcut: e.target.value })}
                  placeholder="Ex: /hello, /prix"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tapez ce raccourci dans le chat pour insérer rapidement le message
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl font-medium disabled:opacity-50"
                >
                  {isCreating || isUpdating ? '...' : editingReply ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Liste des réponses */}
        {quickReplies.length > 0 && (
          <div className="space-y-3">
            {quickReplies.map((reply, index) => (
              <div
                key={reply.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{reply.title}</h3>
                      {reply.shortcut && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-mono">
                          {reply.shortcut}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{reply.content}</p>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      <ChevronUpIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={index === quickReplies.length - 1}
                      className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      <ChevronDownIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleEdit(reply)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100"
                  >
                    <PencilIcon className="h-4 w-4" />
                    Modifier
                  </button>
                  {deleteConfirm === reply.id ? (
                    <>
                      <button
                        onClick={() => handleDelete(reply.id)}
                        disabled={isDeleting}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-red-500 rounded-lg"
                      >
                        Confirmer
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg"
                      >
                        Annuler
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(reply.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                    >
                      <TrashIcon className="h-4 w-4" />
                      Supprimer
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Aide */}
        <div className="bg-purple-50 rounded-xl p-4">
          <h4 className="font-semibold text-purple-900 mb-2">💡 Comment utiliser</h4>
          <ul className="text-sm text-purple-700 space-y-1">
            <li>• Cliquez sur le bouton ⚡ dans le chat pour voir vos réponses</li>
            <li>• Tapez un raccourci (ex: /hello) pour insérer rapidement</li>
            <li>• Réorganisez l'ordre avec les flèches ↑↓</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function QuickRepliesPage() {
  return (
    <ProtectedRoute requiredRole={['COIFFEUSE', 'MANICURISTE', 'VENDEUSE', 'ADMIN']}>
      <QuickRepliesContent />
    </ProtectedRoute>
  );
}

