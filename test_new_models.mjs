import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: "" });

async function run() {
  const modelsToTry = [
      'gemini-2.5-flash',
      'gemini-2.5-flash-image',
      'imagen-4.0-fast-generate-001',
      'imagen-4.0-generate-001'
  ];
  
  for (const m of modelsToTry) {
      try {
        console.log("Trying", m);
        const response = await ai.models.generateContent({
            model: m,
            contents: 'A picture of a cat',
            config: {
                responseModalities: ["IMAGE"],
            }
        });
        const data = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData;
        console.log(m, "generateContent WORKED! Has image:", !!data);
        break;
      } catch (e) {
        console.error(m, "generateContent failed:", e.message);
      }
  }
}
run();
