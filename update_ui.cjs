const fs = require('fs');

const indexFile = 'C:\\Users\\vipul\\.gemini\\antigravity\\scratch\\afwpixelai\\index.tsx';
let content = fs.readFileSync(indexFile, 'utf8');

// 1. Add Custom Prompt, Timer, and FullAccess states to App
content = content.replace(
  'const [activeModal, setActiveModal] = useState<string | null>(null);',
  `const [activeModal, setActiveModal] = useState<string | null>(null);
  const [customPromptText, setCustomPromptText] = useState("");
  const [trialTimeRemaining, setTrialTimeRemaining] = useState(0);
  const [isFullAccess, setIsFullAccess] = useState(() => localStorage.getItem("FULL_ACCESS") === "true");

  useEffect(() => {
    let startTime = localStorage.getItem("TRIAL_START_TIME");
    if (!startTime) {
      startTime = Date.now().toString();
      localStorage.setItem("TRIAL_START_TIME", startTime);
    }
    const updateTimer = () => {
      const elapsed = Math.floor((Date.now() - parseInt(startTime)) / 1000);
      const remaining = Math.max(0, 1200 - elapsed);
      setTrialTimeRemaining(remaining);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);`
);

// 2. Add PaymentModal component
const paymentModalCode = `
const PaymentModal = ({ isOpen, onClose, onUpgrade }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
      <div className="relative w-full max-w-sm overflow-hidden bg-black border-2 border-orange-500 rounded-3xl shadow-2xl">
        <div className="p-8 text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-orange-500 rounded-2xl flex items-center justify-center animate-bounce">
            <i className="fa-solid fa-unlock-keyhole text-black text-2xl"></i>
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-wider">Unlock Full Access</h2>
            <p className="text-orange-500 font-bold mt-2">Your 20-minute free trial has expired.</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 space-y-3 text-left">
            <div className="flex items-center gap-3 text-white"><i className="fa-solid fa-check text-orange-500"></i> <span className="text-sm">Unlimited Art Generations</span></div>
            <div className="flex items-center gap-3 text-white"><i className="fa-solid fa-check text-orange-500"></i> <span className="text-sm">Access to all 30+ Premium Filters</span></div>
            <div className="flex items-center gap-3 text-white"><i className="fa-solid fa-check text-orange-500"></i> <span className="text-sm">Custom Prompts & Photo Restoration</span></div>
            <div className="flex items-center gap-3 text-white"><i className="fa-solid fa-check text-orange-500"></i> <span className="text-sm">No Ads, No Subscriptions</span></div>
          </div>
          <button onClick={onUpgrade} className="w-full py-4 bg-orange-500 hover:bg-orange-400 text-black font-black uppercase tracking-widest rounded-xl transition-all">
            Unlock Now for $4.99
          </button>
          <button onClick={onClose} className="text-slate-400 text-xs font-bold uppercase hover:text-white transition-colors">Maybe Later</button>
        </div>
      </div>
    </div>
  );
};
`;

content = content.replace('const App = () => {', paymentModalCode + '\nconst App = () => {');

// 3. Update handleGenerate to block generation if trial is expired
const handleGenerateUpdate = `
  const handleGenerate = async () => {
    if (!isFullAccess && trialTimeRemaining <= 0) {
      setActiveModal('payment');
      return;
    }
    if (!isKeyValid) {
      setActiveModal('settings');
      return;
    }
    if (!originalImage || !selectedEffectId) return;

    setIsGenerating(true);
    setError(null);

    try {
      const effectDesc = EFFECTS_LIBRARY.find(e => e.id === selectedEffectId)?.desc || "";
      const customDesc = selectedEffectId === 'custom_prompt' ? customPromptText : effectDesc;
      
      // We pass the resolved customDesc or standard effectDesc
      const gen = await generateAiImage(originalImage, customDesc, userApiKey);
      setResultImage(gen);
      setIsPreviewOpen(true);
      const newCount = freeGenCount + 1;
      setFreeGenCount(newCount);
      localStorage.setItem("FREE_GEN_COUNT", newCount.toString());
    } catch (err: any) {
`;
content = content.replace(/const handleGenerate = async \(\) => \{[\s\S]*?try \{/m, handleGenerateUpdate);

// 4. Update Header to show timer
content = content.replace(
  'const Header = ({ customLogo, onOpenSettings }: any) => (',
  'const Header = ({ customLogo, onOpenSettings, isFullAccess, trialTimeRemaining }: any) => ('
);

content = content.replace(
  '<button onClick={onOpenSettings} className="p-2.5 bg-white/5 border border-white/20 rounded-xl hover:bg-white/10 transition-all group">',
  `{!isFullAccess ? (
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
        <button onClick={onOpenSettings} className="p-2.5 bg-white/5 border border-white/20 rounded-xl hover:bg-white/10 transition-all group">`
);

// Update Header usage in App
content = content.replace(
  '<Header customLogo={customLogo} onOpenSettings={() => setActiveModal(\'settings\')} />',
  '<Header customLogo={customLogo} onOpenSettings={() => setActiveModal(\'settings\')} isFullAccess={isFullAccess} trialTimeRemaining={trialTimeRemaining} />'
);

// 5. Add Custom Prompt input in UI
const customPromptUI = `
        {selectedEffectId === 'custom_prompt' && (
          <div className="mt-4 animate-fade-in">
            <textarea
              placeholder="Describe what you want to change..."
              value={customPromptText}
              onChange={(e) => setCustomPromptText(e.target.value)}
              className="w-full bg-white/5 border border-white/20 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors resize-none h-24"
            />
          </div>
        )}
        <button
`;
content = content.replace('<button\n            onClick={handleGenerate}', customPromptUI.replace('<button\n            onClick={handleGenerate}', '<button\n            onClick={handleGenerate}'));

// Add PaymentModal to App Modals
content = content.replace(
  '<DownloadModal isOpen={activeModal === \'download\'} onClose={() => setActiveModal(null)} onDownload={handleDownload} />',
  `<DownloadModal isOpen={activeModal === 'download'} onClose={() => setActiveModal(null)} onDownload={handleDownload} />
      <PaymentModal isOpen={activeModal === 'payment'} onClose={() => setActiveModal(null)} onUpgrade={() => { setIsFullAccess(true); localStorage.setItem("FULL_ACCESS", "true"); setActiveModal(null); }} />`
);

fs.writeFileSync(indexFile, content, 'utf8');
console.log("Successfully updated UI with Timer, PaymentModal, and Custom Prompt.");
