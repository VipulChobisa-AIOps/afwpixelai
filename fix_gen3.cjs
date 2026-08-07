const fs = require('fs');
let content = fs.readFileSync('index.tsx', 'utf8');

// The file is corrupted. We need to rebuild from `const MODELS_TO_TRY = [` to `<div className="flex items-center gap-2">` which was part of `Header`.
// Wait, `replace_file_content` removed:
//  'gemini-2.0-flash-exp',       // Experimental, often very permissive
// ... down to `    <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">`
// Let's just restore it safely.

const correctBlock = `  'gemini-2.0-flash-exp',       // Experimental, often very permissive
  'gemini-2.5-flash',           // User requested 2.5
  'gemini-2.5-flash-lite',
  'gemini-1.5-flash-latest',    // Reliable fallback
  'gemini-1.5-flash',
  'imagen-3.0-generate-001',    // Paid/Billing required model
  'gemini-2.0-pro-exp-02-05',
  'gemini-1.5-pro-latest',
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
  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center overflow-hidden border-2 border-white shadow-[0_0_10px_rgba(255,255,255,0.3)] p-0">
    <img
      src={customSrc || logo}
      alt="afw"
      className="w-full h-full object-contain"
      onError={(e: any) => e.target.src = "https://placehold.co/40x40?text=afw"}
    />
  </div>
);

const Header = ({ customLogo, onOpenSettings, isFullAccess, trialTimeRemaining }: any) => (
  <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
    <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
      <div className="flex items-center gap-2">`;

content = content.replace(/  'gemini-2\.0-flash',           \/\/ Latest stable with excellent free tier\n      <div className="flex items-center gap-2">/, "  'gemini-2.0-flash',           // Latest stable with excellent free tier\n" + correctBlock);

fs.writeFileSync('index.tsx', content, 'utf8');
console.log('Fixed syntax again');
