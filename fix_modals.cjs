const fs = require('fs');
let c = fs.readFileSync('index.tsx', 'utf8');
// Fix InfoModal
c = c.replace(/<div className="p-4 border-t border-white\/10 bg-black\/20 text-center">\s*<p className="text-\[10px\] text-slate-400 font-bold uppercase tracking-widest">Powered by \{APP_CONFIG\.poweredBy\}<\/p>\s*<\/div>\s*\);\s*\};\s*\/\//g, 
`        <div className="p-4 border-t border-white/10 bg-black/20 text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Powered by {APP_CONFIG.poweredBy}</p>
        </div>
      </div>
    </div>
  );
};
//`);

// Fix PaymentModal
c = c.replace(/<button onClick=\{onClose\} className="text-slate-400 text-xs font-bold uppercase hover:text-white transition-colors">Maybe Later<\/button>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\);\s*\};\s*const App/g,
`<button onClick={onClose} className="text-slate-400 text-xs font-bold uppercase hover:text-white transition-colors">Maybe Later</button>
        </div>
      </div>
    </div>
  );
};

const App`);

fs.writeFileSync('index.tsx', c);
console.log('Fixed Modals');
