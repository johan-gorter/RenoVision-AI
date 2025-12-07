import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";
import { GenerationConfig } from "../types";

// Initialize the API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash-image';

export const generateRenovation = async (config: GenerationConfig): Promise<string> => {
  const { prompt, originalImage, maskImage, materialImage } = config;

  const parts: Part[] = [];

  // 1. Add the original image
  // Remove data:image/...;base64, prefix if present for the API call 
  // actually the SDK often handles this or we pass inlineData.
  // The SDK docs example: inlineData: { data: base64String, mimeType: ... }
  
  const cleanBase64 = (dataUrl: string) => dataUrl.split(',')[1];
  const getMimeType = (dataUrl: string) => dataUrl.split(';')[0].split(':')[1];

  parts.push({
    inlineData: {
      data: cleanBase64(originalImage),
      mimeType: getMimeType(originalImage),
    }
  });

  // 2. Add material reference if available
  let promptText = `Task: Edit the first image based on the user instructions.\n\nUser Instruction: "${prompt}"\n`;

  if (materialImage) {
    parts.push({
      inlineData: {
        data: cleanBase64(materialImage),
        mimeType: getMimeType(materialImage),
      }
    });
    promptText += `\nReference Material: Use the texture/style from the second image provided above as a material reference (e.g., for floor, wall, or furniture) if relevant to the instruction.`;
  }

  // 3. Add mask if available
  if (maskImage) {
    parts.push({
      inlineData: {
        data: cleanBase64(maskImage),
        mimeType: 'image/png', // Masks are usually generated as PNGs
      }
    });
    promptText += `\nMasking: A mask image is provided (black background, white/colored marked area). STICTLY limit your edits to the area marked in the mask image. Keep the rest of the image exactly as it is.`;
  }

  parts.push({ text: promptText });

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: parts,
      },
    });

    // Check for inlineData (image) in response
    const candidate = response.candidates?.[0];
    const imagePart = candidate?.content?.parts?.find(p => p.inlineData);

    if (imagePart && imagePart.inlineData && imagePart.inlineData.data) {
        return `data:${imagePart.inlineData.mimeType || 'image/png'};base64,${imagePart.inlineData.data}`;
    }
    
    // If no image returned, it might be a text refusal or error
    throw new Error(candidate?.content?.parts?.[0]?.text || "No image generated");

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};