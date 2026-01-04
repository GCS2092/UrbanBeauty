import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  stock: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: { id: string; name: string; price: number; image?: string; stock: number }, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product, quantity = 1) => {
        const items = get().items;
        const existingItem = items.find(item => item.productId === product.id);
        
        if (existingItem) {
          // Augmenter la quantité si l'article existe déjà
          const newQuantity = Math.min(existingItem.quantity + quantity, product.stock);
          set({
            items: items.map(item =>
              item.productId === product.id
                ? { ...item, quantity: newQuantity }
                : item
            ),
          });
        } else {
          // Ajouter un nouvel article
          set({
            items: [
              ...items,
              {
                id: `${product.id}-${Date.now()}`,
                productId: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: Math.min(quantity, product.stock),
                stock: product.stock,
              },
            ],
          });
        }
      },
      
      removeItem: (productId) => {
        set({
          items: get().items.filter(item => item.productId !== productId),
        });
      },
      
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        
        const items = get().items;
        const item = items.find(i => i.productId === productId);
        if (item) {
          const newQuantity = Math.min(quantity, item.stock);
          set({
            items: items.map(item =>
              item.productId === productId
                ? { ...item, quantity: newQuantity }
                : item
            ),
          });
        }
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      getTotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },
      
      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

