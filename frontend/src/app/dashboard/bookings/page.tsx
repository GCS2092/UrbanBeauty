import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function BookingsPage() {
  // Données d'exemple - à remplacer par un appel API
  const bookings: any[] = [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center text-sm text-gray-600 hover:text-pink-600 mb-6"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Retour au tableau de bord
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">Mes Réservations</h1>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <span className="text-6xl mb-4 block">📅</span>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Aucune réservation</h2>
            <p className="text-gray-600 mb-6">Vous n'avez pas encore de réservation</p>
            <Link
              href="/services"
              className="inline-block bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors"
            >
              Réserver un service
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-gray-900">{booking.service}</h3>
                    <p className="text-sm text-gray-600">{booking.date} à {booking.time}</p>
                    <p className="text-sm text-gray-600">avec {booking.provider}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{booking.price} €</p>
                    <p className="text-sm text-gray-600">{booking.status}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

