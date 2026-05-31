import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { addressesApi } from '../../api/addresses.api';
import AddressCard from '../../components/shared/AddressCard';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/shared/EmptyState';
import Spinner from '../../components/ui/Spinner';
import { toast } from 'sonner';

const schema = z.object({
  label: z.string().min(1, 'Libell� requis'),
  fullName: z.string().min(2, 'Nom requis'),
  phone: z.string().min(6, 'T�l�phone requis'),
  street: z.string().min(3, 'Adresse requise'),
  city: z.string().min(2, 'Ville requise'),
  country: z.string().min(2, 'Pays requis'),
});

export default function Addresses() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const queryClient = useQueryClient();

  const { data: addresses, isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressesApi.getAll().then((r) => r.data),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { country: 'S�n�gal' },
  });

  const openAdd = () => { setEditing(null); reset({ country: 'S�n�gal' }); setOpen(true); };
  const openEdit = (addr) => { setEditing(addr); reset(addr); setOpen(true); };

  const { mutate: save, isPending } = useMutation({
    mutationFn: (data) => editing ? addressesApi.update(editing.id, data) : addressesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['addresses']);
      toast.success(editing ? 'Adresse modifi�e' : 'Adresse ajout�e');
      setOpen(false);
    },
    onError: () => toast.error('Erreur'),
  });

  const { mutate: del } = useMutation({
    mutationFn: (id) => addressesApi.delete(id),
    onSuccess: () => { queryClient.invalidateQueries(['addresses']); toast.success('Adresse supprim�e'); },
  });

  if (isLoading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-stone-800">Mes adresses</h1>
        <Button onClick={openAdd} size="sm">
          <Plus size={16} /> Ajouter
        </Button>
      </div>

      {!addresses?.length ? (
        <EmptyState icon="??" title="Aucune adresse" description="Ajoutez une adresse de livraison"
          action={<Button onClick={openAdd}><Plus size={16} /> Ajouter une adresse</Button>}
        />
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <AddressCard key={addr.id} address={addr} onEdit={openEdit} onDelete={del} />
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Modifier l\'adresse' : 'Nouvelle adresse'}>
        <div className="space-y-3">
          <Input label="Libell�" placeholder="Maison, Bureau..." error={errors.label?.message} {...register('label')} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Nom complet" error={errors.fullName?.message} {...register('fullName')} />
            <Input label="T�l�phone" error={errors.phone?.message} {...register('phone')} />
          </div>
          <Input label="Adresse" error={errors.street?.message} {...register('street')} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Ville" error={errors.city?.message} {...register('city')} />
            <Input label="Pays" error={errors.country?.message} {...register('country')} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">Annuler</Button>
            <Button loading={isPending} onClick={handleSubmit(save)} className="flex-1">
              {editing ? 'Modifier' : 'Ajouter'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
