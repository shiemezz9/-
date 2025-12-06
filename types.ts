export type Language = 'en' | 'zh';

export interface ArtistReference {
  name: string;
  workTitle?: string;
  description: string;
}

export interface VisualElements {
  colors: string[]; // Hex codes or names
  shapes: string[];
  textures: string[];
}

export interface InspirationData {
  conceptTitle: string;
  entryPoint: string; // "Where to start"
  deconstruction: string[]; // "How to break it down"
  visualElements: VisualElements;
  physicalCharacteristics: string; // "Object nature"
  metaphoricalPotential: string; // "Emotional grounding"
  relatedMaterials: string[]; // "Materials matching meaning"
  executionStrategy: string; // "How to turn into a work"
  creativeSuggestions: string[]; // "Next steps"
  artistReferences: ArtistReference[];
  generatedImageUrl?: string; // New field for the generated image
  materialBoardUrl?: string; // New field for the generated material texture board
}

export interface SavedDesign {
  id: string;
  imageUrl: string;
  conceptTitle: string;
  materials: string[];
  colors: string[];
  timestamp: number;
}

export interface AppState {
  status: 'idle' | 'loading' | 'success' | 'error';
  data: InspirationData | null;
  error: string | null;
}