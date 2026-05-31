import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { wishlistApi } from '../../api/wishlist.api';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';
import { formatPrice } from '../../utils/formatPrice';
import EmptyState from '../../components/shared/EmptyState';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { toast } from 'sonner';

export default function Wishlist() {
  const { user } = useAuthStore();
  const { addItem } = useCartStore();
  const queryClient = useQueryClient();

  const { data: wishlist, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => wishlistApi.getAll().then((r) => r.data),
  });

  const { mutate: remove } = useMutation({
    mutationFn: (productId) => wishlistApi.remove(productId),
    onSuccess: () => { queryClient.invalidateQueries(['wishlist']); toast.success('Retir� des favoris'); },
  });

  const handleAddToCart = async (item) => {
    try {
      await addItem(user?.id, { productId: item.product.id, quantity: 1 });
      toast.success('Ajout� au panier !');
    } catch { toast.error('Erreur'); }
  };

  if (isLoading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-stone-800 mb-8">
        Mes favoris {wishlist?.length ? <span className="text-stone-400 font-normal text-xl">({wishlist.length})</span> : ''}
      </h1>

      {!wishlist?.length ? (
        <EmptyState
          icon="??"
          title="Aucun favori"
          description="Ajoutez des produits � vos favoris pour les retrouver facilement"
          action={<Link to="/products"><Button>D�couvrir la boutique</Button></Link>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlist.map((item) => {
            const product = item.product;
            const mainImg = product.images?.find((i) => i.isMain) || product.images?.[0];
            return (
              <div key={item.id} className="bg-white rounded-2xl border border-stone-100 overflow-hidden group">
                <Link to={`/products/${product.slug}`} className="block relative aspect-square bg-stone-50 overflow-hidden">
                  {mainImg ? (
                    <img src={mainImg.url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">???</div>
                  )}
                </Link>
                <div className="p-3">
                  <Link to={`/products/${product.slug}`}>
                    <h3 className="text-sm font-medium text-stone-800 hover:text-rose-500 transition-colors line-clamp-1">{product.name}</h3>
                  </Link>
                  <p className="font-semibold text-stone-900 text-sm mt-1">{formatPrice(product.price)}</p>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => handleAddToCart(item)} className="flex-1 flex items-center justify-center gap-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-medium py-2 rounded-xl transition-colors">
                      <ShoppingBag size={13} /> Ajouter
                    </button>
                    <button onClick={() => remove(product.id)} className="p-2 rounded-xl border border-stone-200 hover:bg-red-50 hover:text-red-500 text-stone-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
