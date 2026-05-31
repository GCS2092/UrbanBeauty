import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Trash2, CheckCheck } from 'lucide-react';
import { notificationsApi } from '../../api/notifications.api';
import { formatRelative } from '../../utils/formatDate';
import { NOTIFICATION_TYPE_LABELS } from '../../utils/constants';
import EmptyState from '../../components/shared/EmptyState';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { toast } from 'sonner';
import { clsx } from 'clsx';

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
    onSuccess: () => { invalidate(); toast.success('Tout marqué comme lu'); },
  });

  const { mutate: del } = useMutation({
    mutationFn: (id) => notificationsApi.delete(id),
    onSuccess: () => { invalidate(); toast.success('Notification supprimée'); },
  });

  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0;

  if (isLoading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-stone-800">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-stone-400 mt-0.5">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAll()}>
            <CheckCheck size={15} /> Tout marquer lu
          </Button>
        )}
      </div>

      {!notifications?.length ? (
        <EmptyState icon="??" title="Aucune notification" description="Vous êtes à jour !" />
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => !notif.isRead && markRead(notif.id)}
              className={clsx(
                'flex gap-4 p-4 rounded-2xl border transition-all cursor-pointer group',
                notif.isRead
                  ? 'bg-white border-stone-100'
                  : 'bg-rose-50/50 border-rose-100 hover:bg-rose-50'
              )}
            >
              <div className={clsx(
                'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                notif.isRead ? 'bg-stone-100 text-stone-400' : 'bg-rose-100 text-rose-500'
              )}>
                <Bell size={18} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={clsx('text-sm font-semibold', notif.isRead ? 'text-stone-600' : 'text-stone-800')}>
                    {notif.title}
                  </p>
                  {!notif.isRead && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  )}
                </div>
                <p className="text-sm text-stone-500 mt-0.5">{notif.message}</p>
                <p className="text-xs text-stone-300 mt-1">{formatRelative(notif.createdAt)}</p>
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); del(notif.id); }}
                className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-stone-300 hover:text-red-400 transition-all shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
