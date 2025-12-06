import React, { useState } from 'react';
import { Search, ArrowRight, Loader2 } from 'lucide-react';
import { Language } from '../types';

interface InputFormProps {
  onSubmit: (query: string) => void;
  isLoading: boolean;
  lang: Language;
}

const SUGGESTIONS = {
  en: ['Melancholy', 'Concrete', 'Morning Light', 'Decay', 'The Ocean'],
  zh: ['忧郁', '混凝土', '晨光', '腐朽', '深海']
};

export const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading, lang }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSubmit(input.trim());
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-10 md:mt-20 px-4">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-stone-400 group-focus-within:text-stone-800 transition-colors" />
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={lang === 'en' 
            ? "Enter an object, emotion, or atmosphere..." 
            : "输入物品、情绪或氛围 (例如：'锈迹', '沉默')..."}
          className="w-full pl-12 pr-14 py-4 md:py-5 bg-white border border-stone-200 rounded-xl shadow-sm text-lg md:text-xl font-serif placeholder:font-sans placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-800 focus:border-transparent transition-all duration-300"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="absolute inset-y-2 right-2 px-4 flex items-center justify-center bg-stone-900 text-white rounded-lg hover:bg-stone-700 disabled:bg-stone-200 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <ArrowRight className="h-5 w-5" />
          )}
        </button>
      </form>
      
      {!isLoading && (
        <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs md:text-sm text-stone-500 font-sans">
          <span>{lang === 'en' ? 'Try:' : '试一试:'}</span>
          {SUGGESTIONS[lang].map((suggestion) => (
            <button 
              key={suggestion}
              onClick={() => {
                setInput(suggestion);
                onSubmit(suggestion);
              }}
              className="hover:text-stone-900 underline underline-offset-2 decoration-stone-300 hover:decoration-stone-900 transition-all"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
