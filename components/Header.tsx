import React from 'react';
import { Sparkles, Languages, Grid3X3 } from 'lucide-react';
import { Language } from '../types';

interface HeaderProps {
  lang: Language;
  onToggleLang: () => void;
}

export const Header: React.FC<HeaderProps> = ({ lang, onToggleLang }) => {
  const scrollToGallery = () => {
    const gallery = document.getElementById('gallery-section');
    if (gallery) {
      gallery.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="w-full py-6 md:py-8 flex flex-col items-center justify-center border-b border-stone-200 bg-stone-50/80 backdrop-blur-sm sticky top-0 z-10">
      
      <div className="absolute right-4 top-4 md:right-8 md:top-8 flex gap-3">
        <button 
          onClick={scrollToGallery}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-stone-200 text-xs font-medium text-stone-600 hover:text-stone-900 hover:border-stone-400 transition-all"
          title={lang === 'en' ? "My Gallery" : "我的画廊"}
        >
          <Grid3X3 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{lang === 'en' ? 'Gallery' : '画廊'}</span>
        </button>

        <button 
          onClick={onToggleLang}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-stone-200 text-xs font-medium text-stone-600 hover:text-stone-900 hover:border-stone-400 transition-all"
        >
          <Languages className="w-3.5 h-3.5" />
          {lang === 'en' ? 'EN / 中文' : '中文 / EN'}
        </button>
      </div>

      <div className="flex items-center gap-3 mb-2">
        <Sparkles className="w-6 h-6 text-stone-800" strokeWidth={1.5} />
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 tracking-tight">
          Muse
        </h1>
      </div>
      <p className="text-stone-500 font-sans text-sm md:text-base tracking-wide uppercase text-center max-w-md px-4">
        {lang === 'en' 
          ? 'Deconstruct objects & emotions into art' 
          : '解构万物与情绪，激发艺术灵感'}
      </p>
    </header>
  );
};