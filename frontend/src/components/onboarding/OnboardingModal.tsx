'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, ShoppingBagIcon, ScissorsIcon, UserGroupIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';

export default function OnboardingModal() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (typeof window !== 'undefined' && !isAuthenticated) {
      const seen = localStorage.getItem('onboarding_seen');
      if (!seen) {
        // Afficher après un court délai pour ne pas être trop intrusif
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated]);

  const handleClose = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboarding_seen', 'true');
    }
    setIsOpen(false);
  };

  const steps = [
    {
      icon: ShoppingBagIcon,
      title: 'Découvrez nos produits',
      description: 'Parcourez notre catalogue de produits de beauté pour cheveux afro. Chaque produit est soigneusement sélectionné pour vous offrir la meilleure qualité.',
      color: 'pink',
      bgColor: 'bg-pink-100',
      iconColor: 'text-pink-600',
      buttonColor: 'bg-pink-600 hover:bg-pink-700',
    },
    {
      icon: ScissorsIcon,
      title: 'Réservez vos services',
      description: 'Trouvez les meilleurs prestataires de coiffure près de chez vous. Réservez vos tresses, locks, perruques et bien plus encore.',
      color: 'purple',
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      buttonColor: 'bg-purple-600 hover:bg-purple-700',
    },
    {
      icon: SparklesIcon,
      title: 'Explorez le lookbook',
      description: 'Inspirez-vous de nos créations et demandez la coiffure de vos rêves directement depuis le lookbook.',
      color: 'yellow',
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
    },
    {
      icon: UserGroupIcon,
      title: 'Commandez facilement',
      description: 'Commandez en tant qu\'invité ou créez un compte pour bénéficier de réductions exclusives. Vous recevrez un code de suivi (ex: UB-ABC123) après votre paiement - capturez-le pour suivre votre commande !',
      color: 'blue',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleClose();
  };

  if (!isOpen || isAuthenticated) {
    return null;
  }

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={handleSkip}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-8">
          {/* Close button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>

          {/* Content */}
          <div className="text-center">
            <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${currentStepData.bgColor} mb-6`}>
              <Icon className={`h-10 w-10 ${currentStepData.iconColor}`} />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {currentStepData.title}
            </h2>

            <p className="text-gray-600 mb-8">
              {currentStepData.description}
            </p>

            {/* Progress dots */}
            <div className="flex justify-center gap-2 mb-8">
              {steps.map((step, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentStep
                      ? `${currentStepData.bgColor.replace('100', '600')} w-8`
                      : 'bg-gray-300 w-2'
                  }`}
                  aria-label={`Aller à l'étape ${index + 1}`}
                />
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex gap-4">
              {currentStep > 0 && (
                <button
                  onClick={handlePrevious}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Précédent
                </button>
              )}
              <button
                onClick={handleNext}
                className={`flex-1 px-4 py-2 ${currentStepData.buttonColor} text-white rounded-lg transition-colors`}
              >
                {currentStep === steps.length - 1 ? 'Commencer' : 'Suivant'}
              </button>
            </div>

            <button
              onClick={handleSkip}
              className="mt-4 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Passer l'introduction
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

