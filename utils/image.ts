
import { ImageData } from "../types";

export const fileToImageData = (file: File): Promise<ImageData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve({
        base64,
        mimeType: file.type
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const dataUrlToImageData = (dataUrl: string): ImageData => {
  const [header, base64] = dataUrl.split(',');
  const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
  return { base64, mimeType };
};
