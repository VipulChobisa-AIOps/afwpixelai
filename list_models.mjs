import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: "" });

async function run() {
  try {
    const models = await ai.models.list();
    for await (const m of models) {
      if (m.name.toLowerCase().includes('image') || m.name.toLowerCase().includes('vision') || (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateImages"))) {
        console.log(m.name, m.supportedGenerationMethods);
      }
    }
    console.log("Done");
  } catch (e) {
    console.error("List failed:", e.message);
  }
}
run();
