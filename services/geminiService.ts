
import { GoogleGenAI } from "@google/genai";
import { MODEL_NAME, SWAP_BAG_PROMPT, CHANGE_SCENE_PROMPT } from "../constants";

// Key management
const STORAGE_KEY = 'gemini_api_key';

// Initialize: Try to get from storage first. 
// Note: We deliberately prioritize localStorage. 
// For the "hasStoredApiKey" check, we will ONLY check localStorage to ensure the UI prompts the user 
// if they haven't manually entered one (even if process.env exists).
let currentApiKey = localStorage.getItem(STORAGE_KEY) || process.env.API_KEY || '';

export const setStoredApiKey = (key: string) => {
  currentApiKey = key;
  localStorage.setItem(STORAGE_KEY, key);
};

export const removeStoredApiKey = () => {
  currentApiKey = '';
  localStorage.removeItem(STORAGE_KEY);
};

// Strict check: Only return true if the user has explicitly saved a key in the browser.
// This prevents the app from auto-logging in with a dev environment key if the user wants a standalone experience.
export const hasStoredApiKey = () => {
  return !!localStorage.getItem(STORAGE_KEY);
};

// Helper to get the AI client.
const getAiClient = () => {
  // If we have a key in memory (either from env or storage), use it.
  // But for the UI "Gate", we use hasStoredApiKey.
  const keyToUse = currentApiKey || process.env.API_KEY;
  
  if (!keyToUse) {
    throw new Error("API Key not found. Please enter a key.");
  }
  return new GoogleGenAI({ apiKey: keyToUse });
};

/**
 * Step 1: Swap the bag color/texture based on a reference image.
 */
export const swapBagStyle = async (
  originalImageBase64: string,
  originalMimeType: string,
  referenceImageBase64: string,
  referenceMimeType: string,
  gridInstruction: string,
  colorDescription: string
): Promise<string> => {
  const ai = getAiClient();

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            text: SWAP_BAG_PROMPT(gridInstruction, colorDescription),
          },
          {
            inlineData: {
              mimeType: originalMimeType,
              data: originalImageBase64,
            },
          },
          {
            text: "Reference Image for the new bag color/texture:",
          },
          {
            inlineData: {
              mimeType: referenceMimeType,
              data: referenceImageBase64,
            },
          },
        ],
      },
      config: {
        temperature: 0.4, // Reduced temperature for stability
        imageConfig: {
          // imageSize is not supported by gemini-2.5-flash-image, removing it.
          aspectRatio: "3:4", // Portrait orientation usually best for full body/torso
        },
      },
    });

    // Extract image from response
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    throw new Error("No image generated.");
  } catch (error) {
    console.error("Error swapping bag:", error);
    throw error;
  }
};

/**
 * Step 2: Change scene and outfit based on the result of Step 1.
 */
export const changeSceneAndOutfit = async (
  currentImageBase64: string,
  outfit: string
): Promise<string> => {
  const ai = getAiClient();

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            text: CHANGE_SCENE_PROMPT(outfit),
          },
          {
            inlineData: {
              mimeType: "image/png", // The output from step 1 is usually PNG or we treat it as such
              data: currentImageBase64,
            },
          },
        ],
      },
      config: {
        temperature: 0.4, // Reduced temperature to prevent hallucinations and keep bag scale stable
        imageConfig: {
           // imageSize is not supported by gemini-2.5-flash-image, removing it.
          aspectRatio: "3:4", 
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    throw new Error("No image generated.");
  } catch (error) {
    console.error("Error changing scene:", error);
    throw error;
  }
};
