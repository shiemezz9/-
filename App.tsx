import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { InputForm } from './components/InputForm';
import { InspirationDisplay } from './components/InspirationDisplay';
import { Gallery } from './components/Gallery';
import { generateInspiration, generateVisual, generateMaterialBoard } from './services/geminiService';
import { AppState, Language, SavedDesign } from './types';
import { AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('zh'); 
  const [state, setState] = useState<AppState>({
    status: 'idle',
    data: null,
    error: null,
  });
  const [savedDesigns, setSavedDesigns] = useState<SavedDesign[]>([]);

  // Load saved designs from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('muse_saved_designs');
      if (saved) {
        setSavedDesigns(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Failed to load saved designs", e);
    }
  }, []);

  const toggleLang = () => {
    setLang(prev => prev === 'en' ? 'zh' : 'en');
  };

  const handleSaveDesign = (designData: Omit<SavedDesign, 'id' | 'timestamp'>) => {
    const newDesign: SavedDesign = {
      ...designData,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };

    const updatedDesigns = [newDesign, ...savedDesigns];
    setSavedDesigns(updatedDesigns);

    try {
      localStorage.setItem('muse_saved_designs', JSON.stringify(updatedDesigns));
    } catch (e) {
      console.error("Storage Limit Exceeded", e);
      // Optional: Alert user if storage is full
      if (lang === 'en') alert("Storage full! Could not save image.");
      else alert("存储空间已满！无法保存图片。");
    }
  };

  const handleDeleteDesign = (id: string) => {
    const updatedDesigns = savedDesigns.filter(d => d.id !== id);
    setSavedDesigns(updatedDesigns);
    localStorage.setItem('muse_saved_designs', JSON.stringify(updatedDesigns));
  };

  const handleSearch = async (query: string) => {
    setState(prev => ({ ...prev, status: 'loading', error: null }));
    
    try {
      // 1. First get the text structure to know what materials to generate
      const inspirationData = await generateInspiration(query, lang);
      
      // 2. Then generate visuals in parallel based on query and results
      const [imageUrl, materialBoardUrl] = await Promise.all([
        generateVisual(query),
        generateMaterialBoard(inspirationData.relatedMaterials.slice(0, 4)) // Use top 4 materials for the board
      ]);

      setState({
        status: 'success',
        data: {
          ...inspirationData,
          generatedImageUrl: imageUrl,
          materialBoardUrl: materialBoardUrl
        },
        error: null,
      });
    } catch (error: any) {
      console.error(error);
      setState({
        status: 'error',
        data: null,
        error: lang === 'en' 
          ? "Failed to generate inspiration. Please try again." 
          : "生成失败，请重试。",
      });
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-stone-200 selection:text-stone-900 flex flex-col">
      <Header lang={lang} onToggleLang={toggleLang} />
      
      <main className="flex-grow flex flex-col items-center w-full max-w-7xl mx-auto">
        
        {/* Only show input form centrally if no data yet */}
        <div className={`w-full transition-all duration-500 ease-in-out ${state.status === 'success' ? 'py-6 border-b border-stone-200 bg-white' : 'flex-grow flex flex-col justify-center pb-32'}`}>
            <InputForm onSubmit={handleSearch} isLoading={state.status === 'loading'} lang={lang} />
        </div>

        {/* Error State */}
        {state.status === 'error' && (
          <div className="mt-8 p-4 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3 text-red-800 max-w-md mx-auto fade-in">
            <AlertCircle className="w-5 h-5" />
            <p>{state.error}</p>
          </div>
        )}

        {/* Loading State - Custom Visual */}
        {state.status === 'loading' && (
          <div className="mt-20 flex flex-col items-center justify-center gap-4 fade-in">
            <div className="relative w-16 h-16">
               <div className="absolute inset-0 border-4 border-stone-200 rounded-full"></div>
               <div className="absolute inset-0 border-4 border-stone-800 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-stone-500 font-serif italic animate-pulse">
              {lang === 'en' ? 'Consulting the muse...' : '正在捕捉灵感...'}
            </p>
          </div>
        )}

        {/* Success State */}
        {state.status === 'success' && state.data && (
          <InspirationDisplay 
            data={state.data} 
            lang={lang} 
            onSave={handleSaveDesign}
          />
        )}

        {/* Gallery Section - Always visible at bottom if there are items */}
        {savedDesigns.length > 0 && (
          <Gallery items={savedDesigns} onDelete={handleDeleteDesign} lang={lang} />
        )}

      </main>
      
      <footer className="w-full py-6 text-center text-stone-400 text-xs uppercase tracking-widest border-t border-stone-200 mt-auto bg-stone-50">
        &copy; {new Date().getFullYear()} Muse AI
      </footer>
    </div>
  );
};

export default App;