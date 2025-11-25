
import React from 'react';

interface LoadingScreenProps {
  message: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center py-32 animate-fade-in">
      <div className="w-8 h-8 border-2 border-gray-100 border-t-black rounded-full animate-spin mb-6"></div>
      <h3 className="text-sm font-medium text-gray-900 tracking-wide mb-2">{message}</h3>
      <p className="text-[10px] text-gray-400 tracking-widest uppercase">AI Processing</p>
    </div>
  );
};
