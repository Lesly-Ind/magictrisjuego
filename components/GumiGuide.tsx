import React from 'react';

interface Props {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const sizeMap = {
  small: 'text-4xl sm:text-5xl',
  medium: 'text-6xl sm:text-7xl',
  large: 'text-7xl sm:text-8xl',
};

const GumiGuide: React.FC<Props> = ({ message, size = 'medium', className = '' }) => {
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div className={`floating-gumi ${sizeMap[size]} select-none drop-shadow-lg`}>
        👾
      </div>
      {message && (
        <div className="bg-white/90 backdrop-blur-md px-5 py-3 rounded-[1.5rem] border-2 border-cyan-300 shadow-lg max-w-xs text-center relative">
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/90 border-l-2 border-t-2 border-cyan-300 rotate-45"></div>
          <p className="text-sm sm:text-base font-bold text-indigo-800 leading-snug">{message}</p>
        </div>
      )}
    </div>
  );
};

export default GumiGuide;
