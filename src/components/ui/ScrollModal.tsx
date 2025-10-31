import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ScrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const ScrollModal: React.FC<ScrollModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md'
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70">
      <div
        className={`scroll-unfurl parchment-card w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto relative`}
      >
        <div className="sticky top-0 bg-parchment-light border-b-2 border-aged-brown pb-4 mb-4 flex justify-between items-center">
          <h2 className="text-3xl font-medieval text-castle-stone text-shadow-gold">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-parchment-dark transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-castle-stone" />
          </button>
        </div>
        <div className="pb-4">
          {children}
        </div>
      </div>
    </div>
  );
};
