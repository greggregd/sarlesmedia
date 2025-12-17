
export interface HeadshotStyle {
  id: string;
  name: string;
  description: string;
  prompt: string;
  previewUrl: string;
}

export type AppStep = 'landing' | 'upload' | 'style' | 'editor';

export interface ImageData {
  base64: string;
  mimeType: string;
}
