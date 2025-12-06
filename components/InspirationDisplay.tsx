import React, { useState, useRef } from 'react';
import { InspirationData, Language, SavedDesign } from '../types';
import { 
  Layers, 
  Palette, 
  Box, 
  Feather, 
  Hammer, 
  User, 
  ExternalLink,
  Camera,
  Check,
  Loader2,
  Sparkles,
  Heart,
  Upload,
  X
} from 'lucide-react';
import { generateSetDesign } from '../services/geminiService';

interface InspirationDisplayProps {
  data: InspirationData;
  lang: Language;
  onSave: (design: Omit<SavedDesign, 'id' | 'timestamp'>) => void;
}

const Card: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; className?: string }> = ({ title, icon, children, className = "" }) => (
  <div className={`bg-white p-6 rounded-xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col gap-4 ${className}`}>
    <div className="flex items-center gap-2 border-b border-stone-50 pb-3">
      <div className="text-stone-400">{icon}</div>
      <h3 className="font-serif text-lg font-semibold text-stone-900">{title}</h3>
    </div>
    <div className="text-stone-600 font-sans leading-relaxed flex-grow">
      {children}
    </div>
  </div>
);

export const InspirationDisplay: React.FC<InspirationDisplayProps> = ({ data, lang, onSave }) => {
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [propImage, setPropImage] = useState<string | null>(null);
  const [isGeneratingSet, setIsGeneratingSet] = useState(false);
  const [setDesignUrl, setSetDesignUrl] = useState<string | null>(null);
  const [hasSaved, setHasSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const labels = {
    deconstruction: lang === 'en' ? "Deconstruction" : "灵感拆解",
    materiality: lang === 'en' ? "Materiality" : "物性特征",
    relatedMaterials: lang === 'en' ? "Related Materials" : "相关材料",
    metaphor: lang === 'en' ? "Metaphor & Emotion" : "隐喻潜力",
    visuals: lang === 'en' ? "Visual Palette" : "视觉元素",
    colors: lang === 'en' ? "Colors" : "色彩",
    shapes: lang === 'en' ? "Shapes" : "形态",
    textures: lang === 'en' ? "Textures" : "肌理",
    execution: lang === 'en' ? "From Idea to Work" : "执行策略",
    prompt: lang === 'en' ? "Creative Prompt" : "创作建议",
    cases: lang === 'en' ? "Case Studies" : "艺术家案例",
    studioGen: lang === 'en' ? "Studio Set Generator" : "摄影布景生成",
    studioDesc: lang === 'en' ? "Select elements to build a photography set." : "选择材料与色彩，生成定制化的摄影棚布景方案。",
    generateBtn: lang === 'en' ? "Generate Set Design" : "生成布景方案",
    saveBtn: lang === 'en' ? "Save to Gallery" : "收藏至画廊",
    saved: lang === 'en' ? "Saved" : "已收藏",
    uploadProp: lang === 'en' ? "Upload Prop (Optional)" : "上传布景道具 (可选)",
    uploadPlaceholder: lang === 'en' ? "Click to upload prop image" : "点击上传道具图片",
    maxMaterials: lang === 'en' ? "(Max 3)" : "(最多3项)",
    propNote: lang === 'en' 
      ? "Note: The AI will identify the main object (e.g. 'Roman Column') and use it as a keyword. The original composition is not preserved." 
      : "注意：AI将识别图片中的主体（例如“罗马柱”），并将其作为关键词用于生成布景，而非直接使用原图。"
  };

  const toggleSelection = (item: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      if (list.length < 3) {
        setList([...list, item]);
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPropImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateSet = async () => {
    if (selectedMaterials.length === 0 && selectedColors.length === 0) return;
    
    setIsGeneratingSet(true);
    setSetDesignUrl(null);
    setHasSaved(false);
    
    const url = await generateSetDesign(
      selectedMaterials.length > 0 ? selectedMaterials : data.relatedMaterials.slice(0, 3), 
      selectedColors.length > 0 ? selectedColors : data.visualElements.colors.slice(0, 3), 
      data.conceptTitle,
      propImage || undefined
    );
    
    if (url) setSetDesignUrl(url);
    setIsGeneratingSet(false);
  };

  const handleSave = () => {
    if (setDesignUrl) {
      onSave({
        imageUrl: setDesignUrl,
        conceptTitle: data.conceptTitle,
        materials: selectedMaterials.length > 0 ? selectedMaterials : ['Default Materials'],
        colors: selectedColors.length > 0 ? selectedColors : ['Default Colors'],
      });
      setHasSaved(true);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pb-20 fade-in">
      
      {/* 1. HERO SECTION: Image Centric */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 items-end">
        
        {/* Left: Title & Concept */}
        <div className="space-y-6 lg:mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-stone-100 rounded-full text-xs font-medium text-stone-500 uppercase tracking-widest">
            <Sparkles className="w-3 h-3" />
            <span>Muse Inspiration</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-serif font-bold text-stone-900 leading-[0.9] tracking-tighter">
            {data.conceptTitle}
          </h1>
          <p className="text-xl md:text-2xl text-stone-500 italic font-serif leading-relaxed border-l-2 border-stone-200 pl-6">
            "{data.entryPoint}"
          </p>
          <div className="flex gap-4 pt-4">
             {data.visualElements.colors.slice(0, 5).map((color, idx) => (
                <div key={idx} className="w-8 h-8 rounded-full border border-stone-200 shadow-sm" style={{ backgroundColor: color }}></div>
             ))}
          </div>
        </div>

        {/* Right: Large Hero Image */}
        <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-xl border border-stone-100 group">
          {data.generatedImageUrl ? (
            <img 
              src={data.generatedImageUrl} 
              alt="Concept Visualization" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-in-out"
            />
          ) : (
            <div className="w-full h-full bg-stone-100 flex items-center justify-center">
              <span className="text-stone-400">Image Generation Failed</span>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
            <span className="text-white font-mono text-sm uppercase tracking-widest">Concept Visualization</span>
          </div>
        </div>
      </div>

      {/* 2. MAIN GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Context & Deconstruction (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
           <Card title={labels.deconstruction} icon={<Layers className="w-5 h-5" />}>
            <ul className="space-y-3">
              {data.deconstruction.map((item, idx) => (
                <li key={idx} className="text-stone-700 leading-relaxed pl-4 border-l border-stone-200">
                  {item}
                </li>
              ))}
            </ul>
          </Card>

          <Card title={labels.metaphor} icon={<Feather className="w-5 h-5" />}>
            <p className="text-stone-800 font-medium italic">
              "{data.metaphoricalPotential}"
            </p>
          </Card>

          <Card title={labels.execution} icon={<Hammer className="w-5 h-5" />}>
             <p className="mb-4 text-sm">{data.executionStrategy}</p>
             <div className="space-y-2">
                {data.creativeSuggestions.map((s, i) => (
                  <div key={i} className="flex gap-2 items-start text-xs text-stone-500">
                    <Check className="w-3 h-3 mt-1 text-stone-400" />
                    <span>{s}</span>
                  </div>
                ))}
             </div>
          </Card>
        </div>

        {/* Middle/Right Column: Visuals & Set Generator (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Material Board Strip */}
          <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
             <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2">
                  <Box className="w-5 h-5 text-stone-400" />
                  <h3 className="font-serif text-lg font-semibold">{labels.materiality}</h3>
               </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="italic text-stone-500 mb-4">"{data.physicalCharacteristics}"</p>
                  <div className="flex flex-wrap gap-2">
                    {data.relatedMaterials.map((mat, idx) => (
                      <span key={idx} className="bg-stone-50 text-stone-600 px-3 py-1 rounded-md text-sm border border-stone-200">
                        {mat}
                      </span>
                    ))}
                  </div>
                </div>
                {data.materialBoardUrl && (
                  <div className="rounded-lg overflow-hidden h-48 md:h-auto">
                    <img src={data.materialBoardUrl} alt="Materials" className="w-full h-full object-cover" />
                  </div>
                )}
             </div>
          </div>

          {/* STUDIO SET GENERATOR (New Feature) */}
          <div className="bg-stone-900 text-stone-50 rounded-2xl p-6 md:p-8 shadow-2xl overflow-hidden relative">
             <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2 text-white">
                   <Camera className="w-6 h-6" />
                   <h2 className="text-2xl font-serif font-bold">{labels.studioGen}</h2>
                </div>
                <p className="text-stone-400 mb-6 max-w-xl">{labels.studioDesc}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                   {/* Controls */}
                   <div className="space-y-6">
                      
                      {/* Material Selection */}
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">{labels.relatedMaterials} {labels.maxMaterials}</h4>
                        <div className="flex flex-wrap gap-2">
                          {data.relatedMaterials.slice(0, 6).map((mat) => (
                            <button
                              key={mat}
                              onClick={() => toggleSelection(mat, selectedMaterials, setSelectedMaterials)}
                              className={`px-3 py-1.5 rounded-full text-xs transition-all border ${
                                selectedMaterials.includes(mat) 
                                ? 'bg-white text-stone-900 border-white font-bold' 
                                : 'bg-transparent text-stone-400 border-stone-700 hover:border-stone-500'
                              }`}
                            >
                              {mat}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Color Selection */}
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">{labels.colors} {labels.maxMaterials}</h4>
                        <div className="flex flex-wrap gap-2">
                          {data.visualElements.colors.map((color) => (
                            <button
                              key={color}
                              onClick={() => toggleSelection(color, selectedColors, setSelectedColors)}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs transition-all border ${
                                selectedColors.includes(color) 
                                ? 'bg-white text-stone-900 border-white font-bold' 
                                : 'bg-transparent text-stone-400 border-stone-700 hover:border-stone-500'
                              }`}
                            >
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></div>
                              {color}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Prop Upload - New Feature */}
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">{labels.uploadProp}</h4>
                        <div 
                          className="border-2 border-dashed border-stone-700 rounded-xl p-2 hover:border-stone-500 transition-colors cursor-pointer relative bg-stone-800/50"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <input 
                            ref={fileInputRef}
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageUpload} 
                            className="hidden" 
                          />
                          
                          {propImage ? (
                            <div className="relative h-24 w-full flex items-center justify-center bg-stone-900/50 rounded-lg">
                               <img src={propImage} alt="Uploaded Prop" className="h-full object-contain p-2" />
                               <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPropImage(null);
                                  if (fileInputRef.current) fileInputRef.current.value = '';
                                }}
                                className="absolute top-1 right-1 bg-stone-900 text-stone-400 hover:text-white rounded-full p-1"
                               >
                                 <X className="w-3 h-3" />
                               </button>
                            </div>
                          ) : (
                            <div className="h-16 flex flex-col items-center justify-center text-stone-500 gap-1">
                              <Upload className="w-5 h-5" />
                              <span className="text-[10px]">{labels.uploadPlaceholder}</span>
                            </div>
                          )}
                        </div>
                        <p className="mt-2 text-[10px] text-stone-500 leading-tight">
                           {labels.propNote}
                        </p>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={handleGenerateSet}
                          disabled={isGeneratingSet || (selectedMaterials.length === 0 && selectedColors.length === 0)}
                          className="flex-1 px-4 py-3 bg-white text-stone-900 rounded-lg font-bold hover:bg-stone-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                        >
                          {isGeneratingSet ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                          {labels.generateBtn}
                        </button>
                      </div>
                   </div>

                   {/* Output Preview */}
                   <div className="aspect-square md:aspect-[3/4] lg:h-full bg-stone-800/50 rounded-xl border border-stone-700/50 flex items-center justify-center overflow-hidden relative group min-h-[400px]">
                      {setDesignUrl ? (
                         <>
                          <img src={setDesignUrl} alt="Set Design" className="w-full h-full object-cover" />
                          <div className="absolute top-2 right-2 z-20">
                             <button
                               onClick={handleSave}
                               disabled={hasSaved}
                               className={`p-2 rounded-full backdrop-blur-md transition-all ${
                                 hasSaved 
                                 ? 'bg-red-500 text-white' 
                                 : 'bg-black/40 text-white hover:bg-black/60 hover:scale-110'
                               }`}
                               title={labels.saveBtn}
                             >
                               <Heart className={`w-5 h-5 ${hasSaved ? 'fill-current' : ''}`} />
                             </button>
                          </div>
                          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 rounded text-[10px] text-white backdrop-blur-md">
                            AI GENERATED SET
                          </div>
                         </>
                      ) : isGeneratingSet ? (
                        <div className="flex flex-col items-center gap-3 text-stone-500">
                           <Loader2 className="w-8 h-8 animate-spin" />
                           <span className="text-xs tracking-widest uppercase">Designing Set...</span>
                        </div>
                      ) : (
                        <div className="text-center p-6">
                           <Camera className="w-12 h-12 text-stone-700 mx-auto mb-2" />
                           <p className="text-stone-600 text-sm">Select options to preview set</p>
                        </div>
                      )}
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* 3. ARTISTS ROW */}
      <div className="mt-16 pt-8 border-t border-stone-200">
        <div className="flex items-center gap-2 mb-8">
           <User className="w-5 h-5 text-stone-400" />
           <h3 className="text-2xl font-serif font-bold text-stone-900">{labels.cases}</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {data.artistReferences.map((artist, idx) => {
            const searchQuery = encodeURIComponent(`${artist.name} ${artist.workTitle || ''} installation art`);
            const googleUrl = `https://www.google.com/search?q=${searchQuery}&tbm=isch`;
            
            return (
              <a 
                key={idx} 
                href={googleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group block bg-white p-5 rounded-lg border border-stone-200 hover:border-stone-800 hover:shadow-lg transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                   <h4 className="font-bold font-serif text-stone-900 group-hover:underline">{artist.name}</h4>
                   <ExternalLink className="w-3 h-3 text-stone-300 group-hover:text-stone-600" />
                </div>
                {artist.workTitle && <p className="text-[10px] uppercase tracking-wide text-stone-400 mb-2 truncate">{artist.workTitle}</p>}
                <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                  {artist.description}
                </p>
              </a>
            );
          })}
        </div>
      </div>

    </div>
  );
};
