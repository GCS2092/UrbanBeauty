import Link from 'next/link';
import { ArrowLeftIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function CartPage() {
  // Données d'exemple - à remplacer par un état global (Zustand)
  const cartItems: any[] = []; // Vide pour l'instant

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Link 
          href="/" 
          className="inline-flex items-center text-sm text-gray-600 hover:text-pink-600 mb-6"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Continuer les achats
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">Panier</h1>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <span className="text-6xl mb-4 block">🛒</span>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Votre panier est vide</h2>
            <p className="text-gray-600 mb-6">Ajoutez des produits pour commencer vos achats</p>
            <Link
              href="/products"
              className="inline-block bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors"
            >
              Découvrir les produits
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Liste des articles */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm p-6 flex items-center gap-4">
                  <div className="h-20 w-20 bg-gradient-to-br from-pink-100 to-rose-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">✨</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.price.toFixed(2)} €</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-900 font-medium">Qté: {item.quantity}</span>
                    <button className="text-red-600 hover:text-red-700">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Résumé */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Résumé</h2>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Sous-total</span>
                    <span>{total.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Livraison</span>
                    <span>Gratuite</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between text-lg font-semibold text-gray-900">
                    <span>Total</span>
                    <span>{total.toFixed(2)} €</span>
                  </div>
                </div>
                <button className="w-full bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors">
                  Passer la commande
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

