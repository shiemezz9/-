import React from 'react';
import { SavedDesign, Language } from '../types';
import { Trash2, Calendar, Tag, Palette } from 'lucide-react';

interface GalleryProps {
  items: SavedDesign[];
  onDelete: (id: string) => void;
  lang: Language;
}

export const Gallery: React.FC<GalleryProps> = ({ items, onDelete, lang }) => {
  if (items.length === 0) return null;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(lang === 'en' ? 'en-US' : 'zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div id="gallery-section" className="w-full max-w-7xl mx-auto px-4 py-16 border-t border-stone-200">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-serif font-bold text-stone-900">
            {lang === 'en' ? 'My Collection' : '我的灵感画廊'}
          </h2>
          <p className="text-stone-500 mt-2">
            {lang === 'en' ? 'Saved studio set designs and concepts.' : '收藏的摄影布景与灵感方案。'}
          </p>
        </div>
        <span className="bg-stone-100 text-stone-600 px-3 py-1 rounded-full text-xs font-medium">
          {items.length} {lang === 'en' ? 'Items' : '个作品'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className="group bg-white rounded-xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col">
            {/* Image Section */}
            <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
              <img 
                src={item.imageUrl} 
                alt={item.conceptTitle} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              
              <button 
                onClick={() => onDelete(item.id)}
                className="absolute top-3 right-3 p-2 bg-white/90 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                title={lang === 'en' ? "Delete" : "删除"}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Content Section */}
            <div className="p-5 flex-grow flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-serif font-bold text-lg text-stone-900 leading-tight">
                  {item.conceptTitle}
                </h3>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-stone-400 mb-4">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(item.timestamp)}</span>
              </div>

              <div className="space-y-3 mt-auto">
                {/* Materials Tags */}
                {item.materials.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    <Tag className="w-3 h-3 text-stone-400 mt-1" />
                    {item.materials.map((mat, idx) => (
                      <span key={idx} className="text-[10px] uppercase tracking-wide px-2 py-0.5 bg-stone-50 border border-stone-100 rounded text-stone-600">
                        {mat}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Color Dots */}
                {item.colors.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Palette className="w-3 h-3 text-stone-400" />
                    <div className="flex gap-1">
                      {item.colors.map((color, idx) => (
                        <div 
                          key={idx} 
                          className="w-4 h-4 rounded-full border border-stone-200" 
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};