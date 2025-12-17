
import { GoogleGenAI } from "@google/genai";
import { ImageData } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async generateHeadshot(sourceImage: ImageData, stylePrompt: string): Promise<string> {
    const prompt = `
      Act as a master professional photographer. 
      Transform the person in the provided selfie into a high-end professional headshot.
      Requirements:
      1. Keep the person's facial features, bone structure, and identity 100% identical.
      2. Style: ${stylePrompt}
      3. Change their clothing to high-quality professional attire suitable for the style.
      4. Ensure perfect lighting and professional studio quality.
      5. The output must be the generated image.
    `;

    return this.processImage(sourceImage, prompt);
  }

  async editHeadshot(currentImage: ImageData, editPrompt: string): Promise<string> {
    const prompt = `
      Take the provided professional headshot and modify it according to the user request.
      User request: "${editPrompt}"
      Maintain the same person and overall professional quality.
      The output must be the modified image.
    `;

    return this.processImage(currentImage, prompt);
  }

  private async processImage(image: ImageData, prompt: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: image.base64,
                mimeType: image.mimeType,
              },
            },
            { text: prompt },
          ],
        },
      });

      if (!response.candidates?.[0]?.content?.parts) {
        throw new Error('No image generated');
      }

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }

      throw new Error('Image part not found in response');
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw error;
    }
  }
}

export const gemini = new GeminiService();
