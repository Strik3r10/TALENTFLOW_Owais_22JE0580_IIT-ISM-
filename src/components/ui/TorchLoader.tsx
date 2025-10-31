import React from 'react';

interface TorchLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export const TorchLoader: React.FC<TorchLoaderProps> = ({ size = 'md', text }) => {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`${sizeClasses[size]} animate-torch-flicker`}>
        🔥
      </div>
      {text && (
        <p className="mt-4 text-castle-stone font-medieval text-lg">
          {text}
        </p>
      )}
    </div>
  );
};
