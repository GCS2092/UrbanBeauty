'use client';

import { useState, useEffect } from 'react';
import { Currency, getSelectedCurrency, setSelectedCurrency, currencies } from '@/utils/currency';

export default function CurrencySelector() {
  const [currency, setCurrency] = useState<Currency>('EUR');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setCurrency(getSelectedCurrency());
  }, []);

  const handleChange = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    setSelectedCurrency(newCurrency);
    setIsOpen(false);
    // Recharger la page pour appliquer les changements partout
    window.location.reload();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <span>{currencies[currency].symbol}</span>
        <span className="text-xs">{currencies[currency].code}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-20 border border-gray-200">
            <div className="py-1">
              <button
                onClick={() => handleChange('EUR')}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
                  currency === 'EUR' ? 'bg-pink-50 text-pink-600' : 'text-gray-700'
                }`}
              >
                <span>Euro (€)</span>
                {currency === 'EUR' && <span className="text-pink-600">✓</span>}
              </button>
              <button
                onClick={() => handleChange('XOF')}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
                  currency === 'XOF' ? 'bg-pink-50 text-pink-600' : 'text-gray-700'
                }`}
              >
                <span>Franc CFA (FCFA)</span>
                {currency === 'XOF' && <span className="text-pink-600">✓</span>}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

