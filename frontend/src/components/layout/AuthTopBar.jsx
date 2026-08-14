import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Tag } from 'lucide-react';
import { couponsApi } from '../../api/coupons.api';
import { STORE_ID } from '../../utils/constants';

/**
 * Top bar pour les pages d'authentification (Login / Register).
 * Remplace la mini navbar avec liens Accueil/Boutique : ceux-ci sont
 * maintenant dans <BottomNav /> en bas de page.
 * Affiche la bannière promo en haut (code coupon actif, si disponible),
 * sinon juste le logo.
 */
export default function AuthTopBar() {
  const [promoCoupons, setPromoCoupons] = useState([]);
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    couponsApi.getPublic(STORE_ID)
      .then(res => setPromoCoupons(res.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (promoCoupons.length <= 1) return;
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentPromoIndex(i => (i + 1) % promoCoupons.length);
        setVisible(true);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, [promoCoupons]);

  const currentPromo = promoCoupons[currentPromoIndex];

  const formatPromo = (coupon) => {
    const reduction = coupon.type === 'PERCENTAGE'
      ? `-${coupon.value}%`
      : `-${coupon.value} FCFA`;
    const min = coupon.minOrderAmount
      ? ` dès ${coupon.minOrderAmount} FCFA`
      : '';
    return `${coupon.code} • ${reduction}${min}`;
  };

  const formatExpiry = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-100">
      {currentPromo && (
        <div
          className="flex items-center justify-center gap-1.5 px-4 py-1.5 text-center"
          style={{
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.4s ease',
            background: 'linear-gradient(90deg, #fff1f2, #ffe4e6)',
            borderBottom: '1px solid #fda4af',
          }}
        >
          <Tag size={12} color="#e11d48" className="shrink-0" />
          <span className="text-[11px] font-semibold text-rose-700 truncate">
            {formatPromo(currentPromo)}
          </span>
          {currentPromo.expiresAt && (
            <span className="text-[10px] text-rose-500/70 shrink-0">
              · {formatExpiry(currentPromo.expiresAt)}
            </span>
          )}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-center">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl">🛍️</span>
          <span className="font-bold text-lg tracking-tight text-stone-800">
            Son<span className="text-rose-400">Shop</span>
          </span>
        </Link>
      </div>
    </header>
  );
}