export interface User {
  username: string;
}

export interface Material {
  id: string;
  name: string;
  category: 'paint' | 'wood' | 'fabric' | 'tile' | 'other';
  imageBase64: string;
  timestamp: number;
}

export interface Project {
  id: string;
  originalImageBase64: string;
  generatedImageBase64?: string;
  prompt: string;
  timestamp: number;
  maskImageBase64?: string;
  usedMaterialId?: string;
}

export type ToolMode = 'view' | 'brush' | 'eraser';

export interface GenerationConfig {
  prompt: string;
  originalImage: string;
  maskImage?: string;
  materialImage?: string;
}