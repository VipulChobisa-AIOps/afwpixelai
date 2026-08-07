const fs = require('fs');

let content = fs.readFileSync('index.tsx', 'utf8');

const replacement = `const generateAiImage = async (originalBase64: string, effectId: string, customApiKey?: string): Promise<string> => {
  const apiKey = customApiKey || "";
  if (!apiKey) throw new Error("MISSING_API_KEY");

  const ai = new GoogleGenAI({ apiKey });
  let finalPrompt = effectId === 'restoration' ? PROMPT_TEMPLATES.restoration : \`\${PROMPT_TEMPLATES.identity} \${PROMPT_TEMPLATES.lens} Edit this image as follows: \${EFFECTS_LIBRARY.find(e => e.id === effectId)?.desc || ""}\`;
  const base64Data = originalBase64.split(',')[1];

  for (const modelName of MODELS_TO_TRY) {
    try {
      console.log(\`[Diagnostic] Attempting \${modelName}...\`);
      const response = await ai.models.generateContent({
        model: modelName,
        contents: { parts: [{ inlineData: { mimeType: 'image/jpeg', data: base64Data } }, { text: finalPrompt }] },
        config: { responseModalities: ["IMAGE"] }
      });
      const data = response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData)?.inlineData;
      if (data) return \`data:\${data.mimeType};base64,\${data.data}\`;
    } catch (error: any) {
      console.error(\`\${modelName} failed:\`, error.message);
      if (error.status === 403 || error.status === 401) throw new Error("INVALID_API_KEY");
    }
  }
  throw new Error("MODEL_NOT_FOUND");
};`;

// Find and replace generateAiImage block
// It might be corrupted so we'll regex match from 'const generateAiImage = async' to 'throw new Error("MODEL_NOT_FOUND");\n};'
const regex = /const generateAiImage = async \([\s\S]*?throw new Error\("MODEL_NOT_FOUND"\);\n\};/;
content = content.replace(regex, replacement);

fs.writeFileSync('index.tsx', content, 'utf8');
console.log('Fixed generateAiImage logic');
