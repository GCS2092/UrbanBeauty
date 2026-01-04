'use client';

import { useState } from 'react';
import { StarIcon as StarIconOutline, HandThumbUpIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid, CheckBadgeIcon } from '@heroicons/react/24/solid';
import { useReviews, useCreateReview, useMarkHelpful } from '@/hooks/useReviews';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/components/admin/NotificationProvider';

interface ReviewSectionProps {
  productId?: string;
  serviceId?: string;
  itemName: string;
}

export default function ReviewSection({ productId, serviceId, itemName }: ReviewSectionProps) {
  const { isAuthenticated, user } = useAuth();
  const notifications = useNotifications();
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  const { data: reviews = [], isLoading } = useReviews({ productId, serviceId });
  const { mutate: createReview, isPending } = useCreateReview();
  const { mutate: markHelpful } = useMarkHelpful();

  // Calculer les stats
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;
  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    percentage: reviews.length > 0 
      ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100 
      : 0
  }));

  // Vérifier si l'utilisateur a déjà laissé un avis
  const userReview = reviews.find(r => r.userId === user?.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      notifications.warning('Note requise', 'Veuillez sélectionner une note');
      return;
    }

    createReview(
      {
        rating,
        comment: comment.trim() || undefined,
        productId,
        serviceId,
      },
      {
        onSuccess: () => {
          notifications.success('Avis publié', 'Merci pour votre avis !');
          setShowForm(false);
          setRating(0);
          setComment('');
        },
        onError: (error: any) => {
          notifications.error('Erreur', error?.response?.data?.message || 'Erreur lors de la publication');
        },
      }
    );
  };

  const handleMarkHelpful = (reviewId: string) => {
    if (!isAuthenticated) {
      notifications.info('Connexion requise', 'Connectez-vous pour voter');
      return;
    }
    markHelpful(reviewId);
  };

  return (
    <div className="mt-12 border-t border-gray-100 pt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Avis clients ({reviews.length})
        </h2>
        {isAuthenticated && !userReview && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
          >
            Donner mon avis
          </button>
        )}
      </div>

      {/* Stats */}
      {reviews.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-6 mb-8 p-4 bg-gray-50 rounded-xl">
          {/* Note moyenne */}
          <div className="text-center sm:text-left sm:pr-6 sm:border-r border-gray-200">
            <div className="text-4xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
            <div className="flex items-center justify-center sm:justify-start gap-0.5 my-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIconSolid
                  key={star}
                  className={`h-4 w-4 ${star <= Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <div className="text-sm text-gray-500">{reviews.length} avis</div>
          </div>

          {/* Distribution */}
          <div className="flex-1 space-y-1">
            {ratingCounts.map(({ star, count, percentage }) => (
              <div key={star} className="flex items-center gap-2 text-sm">
                <span className="w-3 text-gray-600">{star}</span>
                <StarIconSolid className="h-3.5 w-3.5 text-yellow-400" />
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-8 text-gray-500 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formulaire d'avis */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-4 bg-gray-50 rounded-xl">
          <h3 className="font-semibold text-gray-900 mb-4">Votre avis sur {itemName}</h3>
          
          {/* Stars */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Note *</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  {star <= (hoverRating || rating) ? (
                    <StarIconSolid className="h-8 w-8 text-yellow-400" />
                  ) : (
                    <StarIconOutline className="h-8 w-8 text-gray-300" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Commentaire (optionnel)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Partagez votre expérience..."
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setRating(0);
                setComment('');
              }}
              className="px-4 py-2.5 border border-gray-200 rounded-full text-gray-700 text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isPending || rating === 0}
              className="px-6 py-2.5 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {isPending ? 'Publication...' : 'Publier mon avis'}
            </button>
          </div>
        </form>
      )}

      {/* Message si pas connecté */}
      {!isAuthenticated && reviews.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-2">Aucun avis pour le moment</p>
          <a href="/auth/login" className="text-pink-600 font-medium hover:underline">
            Connectez-vous pour laisser un avis
          </a>
        </div>
      )}

      {/* Liste des avis */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-900 border-t-transparent"></div>
        </div>
      ) : reviews.length === 0 && isAuthenticated ? (
        <div className="text-center py-8 text-gray-500">
          <p>Soyez le premier à donner votre avis !</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                    {review.user.profile?.firstName?.charAt(0) || review.user.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {review.user.profile
                          ? `${review.user.profile.firstName} ${review.user.profile.lastName?.charAt(0)}.`
                          : 'Client'}
                      </span>
                      {review.isVerifiedPurchase && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                          <CheckBadgeIcon className="h-3 w-3" />
                          Vérifié
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarIconSolid
                            key={star}
                            className={`h-4 w-4 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-200'}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {review.comment && (
                <p className="text-gray-700 text-sm mt-3">{review.comment}</p>
              )}

              {/* Provider reply */}
              {review.providerReply && (
                <div className="mt-4 ml-6 p-3 bg-gray-50 rounded-lg border-l-2 border-pink-400">
                  <p className="text-xs font-medium text-pink-600 mb-1">
                    Réponse du prestataire
                  </p>
                  <p className="text-sm text-gray-700">{review.providerReply}</p>
                </div>
              )}

              {/* Helpful button */}
              <button
                onClick={() => handleMarkHelpful(review.id)}
                className="mt-3 inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                <HandThumbUpIcon className="h-4 w-4" />
                Utile ({review.helpfulCount})
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

