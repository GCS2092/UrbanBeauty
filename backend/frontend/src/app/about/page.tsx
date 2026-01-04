import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <Link 
          href="/" 
          className="inline-flex items-center text-sm text-gray-600 hover:text-pink-600 mb-6"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Retour à l'accueil
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">À propos de UrbanBeauty</h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            UrbanBeauty est une plateforme innovante qui révolutionne l'expérience beauté en combinant 
            marketplace de produits cosmétiques et réservation de services de coiffure.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Notre Mission</h2>
          <p className="text-gray-600 mb-6">
            Rassembler tout l'univers beauté en un seul endroit : produits, services, inspiration et 
            communauté. Nous connectons les clients aux meilleurs prestataires et vendeuses de produits beauté.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Pourquoi UrbanBeauty ?</h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
            <li>Une sélection rigoureuse de produits cosmétiques de qualité</li>
            <li>Des prestataires vérifiés et notés par la communauté</li>
            <li>Réservation simple et rapide de vos services beauté</li>
            <li>Paiements sécurisés et multiples options</li>
            <li>Une communauté active et bienveillante</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

