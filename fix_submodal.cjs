const fs = require('fs');
let c = fs.readFileSync('index.tsx', 'utf8');

const subModalStr = `const SubscriptionModal = ({ isOpen, onClose, freeGenCount }: any) => {
  const [showSubscription, setShowSubscription] = useState(false);

  if (!isOpen) return null;

  const handlePay = (amount: number) => {
    const upiUrl = \`upi://pay?pa=\${APP_CONFIG.upiId}&pn=\${APP_CONFIG.appName}&am=\${amount}&cu=INR&tn=Subscription for \${APP_CONFIG.appName}\`;
    window.location.href = upiUrl;
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border-2 border-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-white/20 flex justify-between items-center bg-white/5">
          <h2 className="font-black text-white flex items-center gap-3 uppercase tracking-widest">
            <i className="fa-solid fa-crown text-orange-500"></i> Subscription
          </h2>
          <button onClick={onClose} className="text-white hover:scale-110 transition-transform"><i className="fa-solid fa-xmark text-xl"></i></button>
        </div>

        <div className="p-6 overflow-y-auto space-y-8 scrollbar-hide">
          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Free Usage Credits</p>
                <p className="text-lg font-black text-white">{Math.max(0, 3 - freeGenCount)} <span className="text-xs text-orange-500">Remains</span></p>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3].map(i => (
                  <div key={i} className={\`w-3 h-3 rounded-full border border-white/20 \${i <= freeGenCount ? 'bg-slate-700' : 'bg-orange-500 animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.6)]'}\`}></div>
                ))}
              </div>
            </div>

            {!showSubscription ? (
              <button
                onClick={() => setShowSubscription(true)}
                className="w-full py-4 bg-white text-black font-black rounded-2xl border-b-4 border-slate-300 active:border-b-0 active:translate-y-1 transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-crown text-orange-600"></i> Manage Subscription
              </button>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => handlePay(99)} className="p-4 bg-black border border-white/20 rounded-2xl text-left hover:border-white transition-all">
                    <p className="text-[8px] font-black text-slate-500 uppercase">Monthly</p>
                    <p className="text-lg font-black text-white">₹99</p>
                  </button>
                  <button onClick={() => handlePay(599)} className="p-4 bg-black border-2 border-orange-500 rounded-2xl text-left relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-orange-500 text-black text-[7px] font-black px-2 py-0.5 uppercase tracking-tighter">Save</div>
                    <p className="text-[8px] font-black text-slate-500 uppercase">Yearly</p>
                    <p className="text-lg font-black text-white">₹599</p>
                  </button>
                </div>
                <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest text-center">Payment reflects via UPI to {APP_CONFIG.upiId}</p>
                <button onClick={() => setShowSubscription(false)} className="w-full text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-white">Back</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const PaymentModal =`;

c = c.replace('const PaymentModal =', subModalStr);
fs.writeFileSync('index.tsx', c);
console.log('Fixed SubscriptionModal');
