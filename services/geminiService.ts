import { GoogleGenAI } from "@google/genai";

export const generateGreenCat = async (size: string = '1K'): Promise<string | null> => {
  try {
    // Create a new instance right before making the call to ensure the latest API Key is used
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          {
            text: 'A high quality vector art sticker of a cute bright green cat mascot named Miao. The cat has large black eyes, a wide mischievous grin showing small teeth, and a playful pose. Comic book style, thick black outlines, vibrant flat colors, white background. Expressive and funny.',
          },
        ],
      },
      config: {
        imageConfig: {
          imageSize: size as any, // '1K', '2K', or '4K'
          aspectRatio: "1:1"
        }
      }
    });

    // Iterate to find the image part
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64EncodeString: string = part.inlineData.data;
        return `data:image/png;base64,${base64EncodeString}`;
      }
    }
    return null;

  } catch (error) {
    console.error("Failed to generate cat:", error);
    return null;
  }
};