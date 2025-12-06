import { GoogleGenAI, Type } from "@google/genai";
import { InspirationData, Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getSystemInstruction = (lang: Language) => `
You are an expert Creative Director, Art Curator, and Conceptual Artist. 
Your task is to take a user's input (which could be a physical object, a feeling, an atmospheric concept, or a phenomenon) and deconstruct it into a comprehensive creative guide for an art or design project.

You must break the concept down into specific categories:
1. **Entry Point**: The philosophical or immediate angle to approach this topic.
2. **Deconstruction**: Key themes or structural elements to analyze.
3. **Physical Characteristics**: Visual and tactile details to focus on (Materiality).
4. **Metaphorical Potential**: What emotional or abstract meanings this holds (The "Why").
5. **Visual Elements**: Specific colors, shapes, and textures.
6. **Related Materials**: Physical or digital mediums that conceptualy match the input.
7. **Execution Strategy**: How to synthesize this into a final piece.
8. **Artist References**: Real-world artists who have worked with similar themes or materials.

Tone: Sophisticated, inspiring, specific, and practical for creators. Avoid generic advice.
${lang === 'zh' ? 'IMPORTANT: You MUST respond in Simplified Chinese (zh-CN).' : 'Respond in English.'}
`;

export const generateInspiration = async (query: string, lang: Language): Promise<InspirationData> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Deconstruct the following concept into a creative inspiration guide: "${query}". Output language: ${lang === 'zh' ? 'Chinese' : 'English'}.`,
      config: {
        systemInstruction: getSystemInstruction(lang),
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            conceptTitle: { type: Type.STRING, description: "A poetic title for the concept" },
            entryPoint: { type: Type.STRING, description: "Where to start conceptually" },
            deconstruction: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "3-4 bullet points on how to break down the inspiration" 
            },
            visualElements: {
              type: Type.OBJECT,
              properties: {
                colors: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific colors or hex codes" },
                shapes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Dominant forms" },
                textures: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Tactile qualities" },
              }
            },
            physicalCharacteristics: { type: Type.STRING, description: "Object nature and visualized details" },
            metaphoricalPotential: { type: Type.STRING, description: "Emotional grounding and abstract meaning" },
            relatedMaterials: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Materials that match the meaning" },
            executionStrategy: { type: Type.STRING, description: "How to turn it into a complete work" },
            creativeSuggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Actionable next steps" },
            artistReferences: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  workTitle: { type: Type.STRING },
                  description: { type: Type.STRING, description: "Why this artist is relevant" }
                }
              }
            }
          },
          required: [
            "conceptTitle", "entryPoint", "deconstruction", "visualElements", 
            "physicalCharacteristics", "metaphoricalPotential", "relatedMaterials", 
            "executionStrategy", "creativeSuggestions", "artistReferences"
          ]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No data returned from AI");
    
    return JSON.parse(jsonText) as InspirationData;

  } catch (error) {
    console.error("Gemini API Error (Text):", error);
    throw new Error("Failed to generate inspiration. Please try again.");
  }
};

export const generateVisual = async (query: string): Promise<string | undefined> => {
  try {
    const prompt = `Abstract installation art, conceptual photography, high quality, museum lighting, artistic representation of: ${query}. 8k resolution, contemporary art style.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return undefined;
  } catch (error) {
    console.warn("Gemini API Error (Image):", error);
    return undefined; // Fail silently for images to keep the app usable
  }
};

export const generateMaterialBoard = async (materials: string[]): Promise<string | undefined> => {
  try {
    const materialsStr = materials.join(", ");
    const prompt = `Artistic texture moodboard, macro photography, high detail, material study of: ${materialsStr}. Neutral lighting, minimalistic, architectural material palette.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return undefined;
  } catch (error) {
    console.warn("Gemini API Error (Material Board):", error);
    return undefined;
  }
};

// New Helper: Identify the main object in an image using Gemini Multimodal capabilities
const identifyMainObject = async (base64Image: string): Promise<string> => {
  try {
    const matches = base64Image.match(/^data:(.+);base64,(.+)$/);
    if (!matches) return "";

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { 
            inlineData: { 
              mimeType: matches[1], 
              data: matches[2] 
            } 
          },
          { text: "Identify the main single physical object in this image. Return ONLY the object name in English (e.g. 'Roman Column', 'Vintage Chair', 'Vase'). Do not describe the background or colors." }
        ]
      }
    });

    return response.text?.trim() || "";
  } catch (error) {
    console.warn("Object identification failed:", error);
    return "";
  }
};

export const generateSetDesign = async (materials: string[], colors: string[], theme: string, referenceImage?: string): Promise<string | undefined> => {
  try {
    const materialsStr = materials.join(", ");
    const colorsStr = colors.join(", ");
    
    let prompt = `Professional studio photography set design. Theme: "${theme}". 
    Primary Materials: ${materialsStr}. 
    Color Palette: ${colorsStr}. 
    Style: Avant-garde art installation, prop styling, editorial set design. 
    Lighting: Dramatic studio lighting, softbox, chiaroscuro, high contrast.
    8k resolution, photorealistic, cinematic composition.`;

    // Updated Logic: 
    // 1. Identify the object from the image.
    // 2. Add it as a text keyword.
    // 3. DO NOT pass the image to the generation model to avoid strict composition copying.
    if (referenceImage) {
        const identifiedObject = await identifyMainObject(referenceImage);
        
        if (identifiedObject) {
             prompt += `\nCentral Prop: "${identifiedObject}". The set is creatively designed to feature a ${identifiedObject} as the main subject. Recontextualize this object into the scene.`;
        } else {
             // Fallback if identification fails but image was provided
             prompt += `\nKey visual elements: Sculptural props, geometric forms.`;
        }
    } else {
        prompt += `\nKey visual elements: Draped fabrics, suspended objects, geometric structures, or clean minimalist composition.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return undefined;
  } catch (error) {
    console.warn("Gemini API Error (Set Design):", error);
    return undefined;
  }
};
