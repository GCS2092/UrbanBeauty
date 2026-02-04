import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-600 hover:text-pink-600 mb-6"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Retour a l'accueil
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Conditions d'utilisation
        </h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            En utilisant UrbanBeauty, vous acceptez les conditions suivantes.
            Si vous n'etes pas d'accord, veuillez ne pas utiliser la plateforme.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            Comptes et securite
          </h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
            <li>Vous etes responsable de la confidentialite de vos identifiants.</li>
            <li>Vous devez fournir des informations exactes et a jour.</li>
            <li>Tout usage frauduleux peut entrainer une suspension.</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            Achats et reservations
          </h2>
          <p className="text-gray-600 mb-6">
            Les prix, disponibilites et descriptions sont fournis par les
            vendeuses et prestataires. UrbanBeauty facilite la mise en relation
            et le paiement, mais ne garantit pas les services tiers.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            Contenu et avis
          </h2>
          <p className="text-gray-600 mb-6">
            Vous vous engagez a publier du contenu respectueux. UrbanBeauty peut
            supprimer tout contenu inapproprie ou illégal.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            Modifications
          </h2>
          <p className="text-gray-600 mb-6">
            Nous pouvons modifier ces conditions. La version a jour est
            accessible depuis cette page.
          </p>

          <p className="text-gray-600">
            Pour toute question, contactez-nous via la page Contact.
          </p>
        </div>
      </div>
    </div>
  );
}
