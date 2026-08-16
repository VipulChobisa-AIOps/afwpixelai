import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: "" });

async function run() {
  try {
    const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-001',
        prompt: 'A cat',
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
        }
    });
    console.log("generateImages worked:", !!response.generatedImages?.[0]?.image?.imageBytes);
  } catch (e) {
    console.error("generateImages failed:", e.message);
  }
}
run();
