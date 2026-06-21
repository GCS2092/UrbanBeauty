import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Trash2, CheckCheck, Package, Tag, Star, ShoppingBag } from 'lucide-react';
import { notificationsApi } from '../../api/notifications.api';
import { formatRelative } from '../../utils/formatDate';
import EmptyState from '../../components/shared/EmptyState';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { toast } from 'sonner';
import { clsx } from 'clsx';

const TYPE_ICONS = {
  ORDER:      Package,
  PROMOTION:  Tag,
  NEW_PRODUCT: Star,
  DELIVERY:   ShoppingBag,
  default:    Bell,
};

function getIcon(type) {
  return TYPE_ICONS[type] || TYPE_ICONS.default;
}

export default function Notifications() {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getAll().then((r) => r.data),
  });

  const invalidate = () => queryClient.invalidateQueries(['notifications']);

  const { mutate: markRead } = useMutation({
    mutationFn: (id) => notificationsApi.markAsRead(id),
    onSuccess: invalidate,
  });

  const { mutate: markAll } = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      invalidate();
      toast.success('Toutes les notifications sont lues');
    },
  });

  const { mutate: del } = useMutation({
    mutationFn: (id) => notificationsApi.delete(id),
    onSuccess: () => {
      invalidate();
      toast.success('Notification supprimée');
    },
  });

  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-stone-800">Notifications</h1>
          <p className="text-sm text-stone-400 mt-0.5">
            {unreadCount > 0
              ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}`
              : 'Tout est lu'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAll()}>
            <CheckCheck size={14} /> Tout marquer lu
          </Button>
        )}
      </div>

      {/* List */}
      {!notifications?.length ? (
        <EmptyState
          icon="🔔"
          title="Aucune notification"
          description="Vous êtes à jour !"
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => {
            const Icon = getIcon(notif.type);
            return (
              <div
                key={notif.id}
                onClick={() => !notif.isRead && markRead(notif.id)}
                className={clsx(
                  'flex gap-3 p-4 rounded-2xl border transition-all cursor-pointer group',
                  notif.isRead
                    ? 'bg-white border-stone-100 hover:border-stone-200'
                    : 'bg-rose-50/60 border-rose-100 hover:bg-rose-50'
                )}
              >
                {/* Icon */}
                <div
                  className={clsx(
                    'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                    notif.isRead
                      ? 'bg-stone-100 text-stone-400'
                      : 'bg-rose-100 text-rose-500'
                  )}
                >
                  <Icon size={16} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={clsx(
                        'text-sm font-semibold leading-snug',
                        notif.isRead ? 'text-stone-600' : 'text-stone-800'
                      )}
                    >
                      {notif.title}
                    </p>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                    {notif.message}
                  </p>
                  <p className="text-xs text-stone-300 mt-1">
                    {formatRelative(notif.createdAt)}
                  </p>
                </div>

                {/* Delete */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    del(notif.id);
                  }}
                  aria-label="Supprimer"
                  className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-stone-300 hover:text-red-400 transition-all shrink-0 self-start mt-0.5"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}