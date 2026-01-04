import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function FAQPage() {
  const faqs = [
    {
      question: 'Comment puis-je créer un compte ?',
      answer: 'Cliquez sur "Connexion" dans le menu, puis sur "S\'inscrire". Remplissez le formulaire avec vos informations.',
    },
    {
      question: 'Comment réserver un service de coiffure ?',
      answer: 'Parcourez les services disponibles, sélectionnez celui qui vous intéresse et cliquez sur "Réserver maintenant".',
    },
    {
      question: 'Quels sont les modes de paiement acceptés ?',
      answer: 'Nous acceptons les cartes bancaires via Stripe et les paiements Mobile Money via Paystack.',
    },
    {
      question: 'Comment devenir prestataire ?',
      answer: 'Créez un compte, puis sélectionnez le rôle "Coiffeuse" ou "Vendeuse" lors de l\'inscription.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <Link 
          href="/" 
          className="inline-flex items-center text-sm text-gray-600 hover:text-pink-600 mb-6"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Retour à l'accueil
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">Questions Fréquentes</h1>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

