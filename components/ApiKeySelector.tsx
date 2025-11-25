
import React, { useState, useEffect } from 'react';
import { setStoredApiKey, hasStoredApiKey } from '../services/geminiService';

interface ApiKeySelectorProps {
  onKeySelected: () => void;
}

export const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onKeySelected }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [inputKey, setInputKey] = useState('');

  useEffect(() => {
    // Check if key exists in local storage on mount
    if (hasStoredApiKey()) {
      setIsVisible(false);
      onKeySelected();
    }
  }, [onKeySelected]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputKey.trim()) {
      setStoredApiKey(inputKey.trim());
      setIsVisible(false);
      onKeySelected();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white animate-fade-in">
      <div className="max-w-md w-full px-8 text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-serif italic text-black mb-2">BAO你發</h1>
          <p className="text-[10px] font-bold tracking-[0.3em] text-gray-400 uppercase">Virtual Fashion Studio</p>
        </div>

        <div className="bg-gray-50 p-10 shadow-[0_20px_40px_rgba(0,0,0,0.05)] border border-gray-100">
          <h2 className="text-xs font-bold tracking-[0.2em] mb-8 text-black uppercase">Access Required</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 text-left">
              <label htmlFor="apiKey" className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                請輸入 Gemini API Key
              </label>
              <input
                id="apiKey"
                type="password"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="AIza..."
                className="w-full bg-white border border-gray-200 px-4 py-3 text-sm focus:border-black focus:outline-none transition-colors placeholder:text-gray-300 font-mono"
                autoComplete="off"
              />
            </div>

            <button
              type="submit"
              disabled={!inputKey.trim()}
              className="w-full py-4 bg-black text-white hover:bg-gray-900 transition-all duration-300 uppercase tracking-[0.2em] text-[10px] font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              進入工作室 (Enter)
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-[10px] text-gray-400 leading-relaxed">
            您的 API Key 僅會儲存於本地瀏覽器 (Local Storage)，不會上傳至任何第三方伺服器。<br/>
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-black underline mt-2 inline-block hover:no-underline"
            >
              在此獲取 API Key
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
