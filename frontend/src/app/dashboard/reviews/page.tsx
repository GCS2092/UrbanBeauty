'use client';

import Link from 'next/link';
import { useState } from 'react';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { ArrowLeftIcon, StarIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { useNotifications } from '@/components/admin/NotificationProvider';
import { reviewsService, Review } from '@/services/reviews.service';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';

function ReviewsContent() {
  const { user } = useAuth();
  const notifications = useNotifications();
  const queryClient = useQueryClient();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Récupérer les avis des services du prestataire
  const { data: reviews = [], isLoading } = useQuery<Review[]>({
    queryKey: ['provider-reviews', user?.profile?.id],
    queryFn: async () => {
      if (!user?.profile?.id) return [];
      // Utiliser providerId dans la requête
      const reviews = await reviewsService.findAll(undefined, undefined, user.profile.id);
      return reviews;
    },
    enabled: !!user?.profile?.id,
  });

  const replyMutation = useMutation({
    mutationFn: async ({ reviewId, reply }: { reviewId: string; reply: string }) => {
      return reviewsService.reply(reviewId, { reply });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-reviews'] });
      notifications.success('Réponse envoyée', 'Votre réponse a été publiée');
      setReplyingTo(null);
      setReplyText('');
    },
    onError: (error: any) => {
      notifications.error('Erreur', error?.response?.data?.message || 'Erreur lors de l\'envoi de la réponse');
    },
  });

  const handleReply = (reviewId: string) => {
    if (!replyText.trim()) {
      notifications.error('Erreur', 'La réponse ne peut pas être vide');
      return;
    }
    replyMutation.mutate({ reviewId, reply: replyText });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm text-gray-600 hover:text-pink-600 mb-6"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Retour au tableau de bord
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Avis sur mes services</h1>

        {reviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucun avis pour le moment</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {review.user.profile?.avatar ? (
                        <img
                          src={review.user.profile.avatar}
                          alt={review.user.profile.firstName}
                          className="h-12 w-12 rounded-full"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-pink-100 flex items-center justify-center">
                          <span className="text-pink-600 font-semibold">
                            {review.user.profile?.firstName?.[0] || review.user.email[0].toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900">
                          {review.user.profile
                            ? `${review.user.profile.firstName} ${review.user.profile.lastName}`
                            : review.user.email}
                        </p>
                        {review.isVerifiedPurchase && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            ✓ Achat vérifié
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarIcon
                            key={star}
                            className={`h-5 w-5 ${
                              star <= review.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      {review.service && (
                        <p className="text-sm text-gray-600">
                          Service: {review.service.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>

                {review.comment && (
                  <p className="text-gray-700 mb-4">{review.comment}</p>
                )}

                {/* Réponse du prestataire */}
                {review.providerReply ? (
                  <div className="bg-gray-50 rounded-lg p-4 mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-semibold text-gray-900">Votre réponse</p>
                      {review.providerReplyAt && (
                        <p className="text-xs text-gray-500">
                          {new Date(review.providerReplyAt).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                    </div>
                    <p className="text-gray-700">{review.providerReply}</p>
                  </div>
                ) : (
                  <div className="mt-4">
                    {replyingTo === review.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Écrivez votre réponse..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReply(review.id)}
                            disabled={replyMutation.isPending}
                            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50"
                          >
                            {replyMutation.isPending ? 'Envoi...' : 'Envoyer la réponse'}
                          </button>
                          <button
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyText('');
                            }}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReplyingTo(review.id)}
                        className="flex items-center gap-2 px-4 py-2 text-pink-600 border border-pink-600 rounded-lg hover:bg-pink-50 transition-colors"
                      >
                        <ChatBubbleLeftRightIcon className="h-5 w-5" />
                        Répondre à cet avis
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReviewsPage() {
  return (
    <ProtectedRoute requiredRole="COIFFEUSE">
      <ReviewsContent />
    </ProtectedRoute>
  );
}

