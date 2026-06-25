import { useState } from 'react';
import useAuthStore from '../store/authStore';

function getActiveStoreIdFromToken(token) {
  if (!token) return '';
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload?.activeStoreId || '';
  } catch {
    return '';
  }
}

/** Filtre boutique admin — initialisé depuis le JWT (StoreSwitcher). */
export function useAdminStoreFilter() {
  const { token } = useAuthStore();
  const [storeId, setStoreId] = useState(() => getActiveStoreIdFromToken(token));
  return [storeId, setStoreId];
}

export { getActiveStoreIdFromToken };
