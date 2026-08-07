const fs = require('fs');
let content = fs.readFileSync('index.tsx', 'utf8');

const replacement = `  'gemini-2.0-flash-exp',       // Experimental, often very permissive
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
      <div className="flex items-center gap-2">
        <Logo customSrc={customLogo} />
        <h1 className="text-xl font-bold tracking-tight"><span className="text-slate-100">Pixel</span><span className="text-orange-500">Ai</span></h1>
      </div>
      <div className="flex items-center gap-3">
        {!isFullAccess ? (
          <div className="px-3 py-1 bg-white/10 border border-white/20 rounded-xl flex items-center gap-2">
            <i className="fa-solid fa-clock text-orange-500"></i>
            <span className="text-white font-mono text-xs font-bold">{Math.floor(trialTimeRemaining/60)}:{(trialTimeRemaining%60).toString().padStart(2,'0')}</span>
          </div>
        ) : (
          <div className="px-3 py-1 bg-orange-500/20 border border-orange-500/50 rounded-xl flex items-center gap-2">
            <i className="fa-solid fa-crown text-orange-500"></i>
            <span className="text-orange-500 text-xs font-black uppercase">PRO</span>
          </div>
        )}
        <button onClick={onOpenSettings} className="p-2.5 bg-white/5 border border-white/20 rounded-xl hover:bg-white/10 transition-all group">
          <i className="fa-solid fa-gear text-lg text-slate-300 group-hover:text-white group-hover:rotate-90 transition-all"></i>
        </button>
      </div>
    </div>
  </header>
);

const DownloadModal =`;

// Replace from '  'gemini-2.0-flash',           // Latest stable with excellent free tier'
// To 'const DownloadModal ='

const regex = /  'gemini-2\.0-flash',           \/\/ Latest stable with excellent free tier[\s\S]*?const DownloadModal =/;
content = content.replace(regex, "  'gemini-2.0-flash',           // Latest stable with excellent free tier\n" + replacement);

fs.writeFileSync('index.tsx', content, 'utf8');
console.log('Final fix applied');
