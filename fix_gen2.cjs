const fs = require('fs');

const file = 'index.tsx';
let content = fs.readFileSync(file, 'utf8');

// I will insert it right before `<div className="w-10 h-10`
const replacement = `  'gemini-1.5-pro-latest',
  'gemini-pro-vision',
];

// --- AI Service ---

const generateAiImage = async (originalBase64: string, effectId: string, customApiKey?: string): Promise<string> => {
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
};

// --- Components ---

const Logo = ({ customSrc }: any) => (
`;

content = content.replace(/  'gemini-1\.5-pro-latest',\n  'gemini-pro-vision',\n\];\n\n\/\/ --- AI Service ---\n\nconst generateAiImage = async \([\s\S]*?const Logo = \(\{ customSrc \}: any\) => \(\n/m, replacement);
content = content.replace(/  'gemini-2\.0-pro-exp-02-05',\n  <div className="w-10 h-10/m, replacement + '  <div className="w-10 h-10');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed');
