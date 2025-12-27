'use client';

import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface MaintenanceBannerProps {
  message: string;
  onClose?: () => void;
  variant?: 'warning' | 'error';
}

export default function MaintenanceBanner({ 
  message, 
  onClose,
  variant = 'warning' 
}: MaintenanceBannerProps) {
  return (
    <div className={`${
      variant === 'error' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
    } border-l-4 p-4 mb-4 rounded-r-lg`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className={`h-5 w-5 ${
            variant === 'error' ? 'text-red-600' : 'text-yellow-600'
          }`} />
        </div>
        <div className="ml-3 flex-1">
          <p className={`text-sm ${
            variant === 'error' ? 'text-red-800' : 'text-yellow-800'
          }`}>
            {message}
          </p>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              type="button"
              onClick={onClose}
              className={`inline-flex rounded-md p-1.5 ${
                variant === 'error' 
                  ? 'text-red-500 hover:bg-red-100' 
                  : 'text-yellow-500 hover:bg-yellow-100'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                variant === 'error' 
                  ? 'focus:ring-red-600' 
                  : 'focus:ring-yellow-600'
              }`}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

