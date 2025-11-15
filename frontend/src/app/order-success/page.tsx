'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircleIcon, ArrowLeftIcon, CameraIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import api from '@/lib/api';

interface Order {
  orderNumber: string;
  trackingCode: string;
}

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber');
  const trackingCodeFromUrl = searchParams.get('trackingCode');
  const [order, setOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Fonction pour sauvegarder le code de suivi dans localStorage
    const saveTrackingCode = (code: string) => {
      if (typeof window === 'undefined' || !code) return;
      
      const savedCodes = localStorage.getItem('recent_tracking_codes');
      let codes: string[] = savedCodes ? JSON.parse(savedCodes) : [];
      
      // Ajouter le code s'il n'existe pas déjà
      if (!codes.includes(code)) {
        codes.unshift(code); // Ajouter au début
        // Garder seulement les 10 dernières commandes
        codes = codes.slice(0, 10);
        localStorage.setItem('recent_tracking_codes', JSON.stringify(codes));
      }
    };

    // Si le trackingCode est déjà dans l'URL, l'utiliser directement
    if (trackingCodeFromUrl && orderNumber) {
      setOrder({
        orderNumber,
        trackingCode: trackingCodeFromUrl,
      });
      saveTrackingCode(trackingCodeFromUrl);
      return;
    }

    // Sinon, essayer de récupérer depuis l'API
    if (orderNumber) {
      // Récupérer les détails de la commande pour obtenir le trackingCode
      api.get(`/api/orders?orderNumber=${orderNumber}`)
        .then((response) => {
          const orders = response.data;
          const foundOrder = Array.isArray(orders) ? orders.find((o: any) => o.orderNumber === orderNumber) : orders;
          if (foundOrder) {
            const trackingCode = foundOrder.trackingCode || foundOrder.orderNumber;
            setOrder({
              orderNumber: foundOrder.orderNumber,
              trackingCode,
            });
            saveTrackingCode(trackingCode);
          }
        })
        .catch(() => {
          // Si on ne peut pas récupérer, on utilise juste le orderNumber
          if (orderNumber) {
            setOrder({
              orderNumber,
              trackingCode: orderNumber,
            });
          }
        });
    }
  }, [orderNumber, trackingCodeFromUrl]);

  const handleCopyCode = () => {
    if (order?.trackingCode) {
      navigator.clipboard.writeText(order.trackingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-2xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center mb-8">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Commande confirmée !</h1>
            {orderNumber && (
              <p className="text-lg text-gray-600 mb-2">
                Numéro de commande : <span className="font-semibold text-pink-600">{orderNumber}</span>
              </p>
            )}
            {order?.trackingCode && (
              <div className="mt-4 p-4 bg-pink-50 rounded-lg border border-pink-200">
                <p className="text-sm font-medium text-gray-700 mb-2">Code de suivi de votre commande</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl font-bold text-pink-600 font-mono">{order.trackingCode}</span>
                  <button
                    onClick={handleCopyCode}
                    className="p-2 text-pink-600 hover:bg-pink-100 rounded-lg transition-colors"
                    title="Copier le code"
                  >
                    {copied ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    ) : (
                      <ClipboardDocumentIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  💡 <strong>Important :</strong> Capturez une photo de ce code ou copiez-le pour suivre votre commande plus tard !
                </p>
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Comment suivre votre commande ?</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Utilisez le code de suivi ci-dessus pour retrouver votre commande</li>
              <li>Allez dans "Mes commandes" dans le menu ou visitez /orders/track</li>
              <li>Entrez votre code de suivi pour voir le statut de votre commande</li>
              <li>Vous recevrez également un email de confirmation avec tous les détails</li>
            </ul>
          </div>

          <p className="text-gray-600 mb-6 text-center">
            Merci pour votre commande ! Vous recevrez un email de confirmation sous peu.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/orders/track"
              className="inline-flex items-center justify-center px-6 py-3 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 transition-colors"
            >
              <CameraIcon className="h-5 w-5 mr-2" />
              Suivre ma commande
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Retour à l'accueil
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Continuer les achats
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}

