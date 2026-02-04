import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function PrivacyPage() {
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
          Politique de confidentialite
        </h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            Cette politique explique quelles donnees nous collectons, pourquoi
            nous les utilisons et comment vous pouvez les gerer.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            Donnees collectees
          </h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
            <li>Informations de compte (email, nom, numero de telephone)</li>
            <li>Donnees de profil (photo, bio, preferences)</li>
            <li>Historique de commandes et reservations</li>
            <li>Informations de paiement (traitees par des prestataires securises)</li>
            <li>Donnees d'usage pour ameliorer le service</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            Utilisation des donnees
          </h2>
          <p className="text-gray-600 mb-6">
            Nous utilisons vos donnees pour creer et gerer votre compte, traiter
            vos commandes et reservations, fournir un support, et ameliorer
            l'experience UrbanBeauty.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            Partage des donnees
          </h2>
          <p className="text-gray-600 mb-6">
            Nous partageons certaines informations uniquement avec les
            prestataires, vendeuses ou services techniques necessaires au bon
            fonctionnement de la plateforme. Nous ne vendons jamais vos donnees.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            Vos droits
          </h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
            <li>Acceder, corriger ou supprimer vos donnees</li>
            <li>Retirer votre consentement aux notifications</li>
            <li>Exporter vos donnees sur demande</li>
          </ul>

          <p className="text-gray-600">
            Pour toute question, contactez-nous via la page Contact.
          </p>
        </div>
      </div>
    </div>
  );
}
