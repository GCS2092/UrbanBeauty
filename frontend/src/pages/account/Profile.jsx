import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { User } from 'lucide-react';
import { authApi } from '../../api/auth.api';
import { usersApi } from '../../api/users.api';
import useAuthStore from '../../store/authStore';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { toast } from 'sonner';
import { useEffect } from 'react';

const schema = z.object({
  firstName: z.string().min(2, 'Prénom requis'),
  lastName: z.string().min(2, 'Nom requis'),
  phone: z.string().optional(),
});

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => authApi.me().then((r) => r.data),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (profile) reset({ firstName: profile.firstName, lastName: profile.lastName, phone: profile.phone || '' });
  }, [profile]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => usersApi ? usersApi.update(data) : authApi.me(),
    onSuccess: (res) => {
      updateUser(res.data);
      queryClient.invalidateQueries(['profile']);
      toast.success('Profil mis à jour !');
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-500 text-2xl font-bold">
          {user?.firstName?.[0]?.toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-stone-800">{user?.firstName} {user?.lastName}</h1>
          <p className="text-stone-400 text-sm">{user?.email}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 p-6 space-y-4">
        <h2 className="font-semibold text-stone-800 flex items-center gap-2">
          <User size={17} className="text-rose-400" /> Informations personnelles
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Prénom" error={errors.firstName?.message} {...register('firstName')} />
          <Input label="Nom" error={errors.lastName?.message} {...register('lastName')} />
        </div>
        <Input label="Email" value={user?.email || ''} disabled hint="L'email ne peut pas être modifié" />
        <Input label="Téléphone" placeholder="+221 77 000 00 00" {...register('phone')} />
        <div className="pt-2">
          <Button loading={isPending} onClick={handleSubmit(mutate)}>
            Sauvegarder les modifications
          </Button>
        </div>
      </div>
    </div>
  );
}
