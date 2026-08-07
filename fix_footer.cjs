const fs = require('fs');
let content = fs.readFileSync('index.tsx', 'utf8');

// The file currently has:
/*
      <SubscriptionModal isOpen={activeModal === 'subscription'} onClose={() => setActiveModal(null)} freeGenCount={freeGenCount} />
      <DownloadModal isOpen={activeModal === 'download'} onClose={() => setActiveModal(null)} onDownload={handleDownload} />

        <div className="flex items-center justify-center gap-8 text-2xl">
*/

const regex = /<SubscriptionModal[\s\S]*?<DownloadModal[\s\S]*?<div className="flex items-center justify-center gap-8 text-2xl">/;

const replacement = `<SubscriptionModal isOpen={activeModal === 'subscription'} onClose={() => setActiveModal(null)} freeGenCount={freeGenCount} />
      <DownloadModal isOpen={activeModal === 'download'} onClose={() => setActiveModal(null)} onDownload={handleDownload} />
      <PaymentModal isOpen={activeModal === 'payment'} onClose={() => setActiveModal(null)} onUpgrade={() => { setIsFullAccess(true); localStorage.setItem("FULL_ACCESS", "true"); setActiveModal(null); }} />

      <footer className="px-6 py-12 text-center text-white text-[10px] bg-black border-t-2 border-white mt-auto space-y-8">
        <div className="font-black uppercase tracking-[0.4em] text-white flex items-center justify-center gap-3">
          <span className="w-6 h-[1px] bg-white/30"></span>
          App Powered by {APP_CONFIG.poweredBy}
          <span className="w-6 h-[1px] bg-white/30"></span>
        </div>

        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
          <button onClick={() => setActiveModal('about')} className="py-3 border border-white/30 rounded-xl font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">About</button>
          <button onClick={() => setActiveModal('policy')} className="py-3 border border-white/30 rounded-xl font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">Policy</button>
          <button onClick={() => setActiveModal('contact')} className="py-3 border border-white/30 rounded-xl font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">Contact</button>
        </div>

        <div className="flex items-center justify-center gap-8 text-2xl">`;

content = content.replace(regex, replacement);
fs.writeFileSync('index.tsx', content, 'utf8');
console.log("Restored footer");
