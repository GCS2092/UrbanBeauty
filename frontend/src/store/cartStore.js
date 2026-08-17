import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import { ANONYMOUS_CART_KEY } from '../utils/constants';
import { cartApi } from '../api/cart.api';
import { v4 as uuidv4 } from 'uuid';

const getOrCreateAnonymousId = () => {
  let id = localStorage.getItem(ANONYMOUS_CART_KEY);
  if (!id) {
    id = uuidv4();
    localStorage.setItem(ANONYMOUS_CART_KEY, id);
  }
  return id;
};

const updateTimers = {};

const useCartStore = create(
  persist(
    (set, get) => ({
      cart: null,
      loading: false,
      lastRemovedItem: null,

      getCartParams: (userId) => {
        if (userId) return { userId };
        return { anonymousId: getOrCreateAnonymousId() };
      },

      fetchCart: async (userId) => {
        set({ loading: true });
        try {
          const params = get().getCartParams(userId);
          const { data } = await cartApi.getCart(params);
          set({ cart: data });
        } catch {
          set({ cart: null });
        } finally {
          set({ loading: false });
        }
      },

      addItem: async (userId, itemData) => {
        const params = get().getCartParams(userId);
        await cartApi.addItem({ ...params, ...itemData });
        await get().fetchCart(userId);
      },

      updateItem: (userId, itemId, quantity) => {
        set((state) => {
          if (!state.cart) return state;
          const items = state.cart.items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          );
          return { cart: { ...state.cart, items } };
        });

        clearTimeout(updateTimers[itemId]);
        updateTimers[itemId] = setTimeout(async () => {
  try {
    await cartApi.updateItem(itemId, { quantity }, get().getCartParams(userId)); // ✅ params ajouté
    await get().fetchCart(userId);
  } catch (err) {
    const message = err?.response?.data?.message || "Impossible de modifier la quantité.";
    toast.error(message);
    await get().fetchCart(userId);
  }
}, 500);
      },

      removeItem: async (userId, itemId) => {
  const removedItem = get().cart?.items.find((i) => i.id === itemId);
  set({ lastRemovedItem: removedItem || null });

  await cartApi.removeItem(itemId, get().getCartParams(userId)); // ✅ params ajouté
  await get().fetchCart(userId);
},
      undoRemove: async (userId) => {
        const removed = get().lastRemovedItem;
        if (!removed) return;
        await get().addItem(userId, {
          productId: removed.product.id,
          variantId: removed.variant?.id || null,
          quantity: removed.quantity,
        });
        set({ lastRemovedItem: null });
      },

      clearCart: async (userId) => {
        const params = get().getCartParams(userId);
        await cartApi.clearCart(params);
        set({ cart: null });
      },

      getTotalItems: () => {
        const items = get().cart?.items || [];
        return items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getTotalPrice: () => {
        const items = get().cart?.items || [];
        return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      },
    }),
    {
      name: 'urban-cart',
      partialize: (state) => ({ cart: state.cart }),
    }
  )
);

export default useCartStore;