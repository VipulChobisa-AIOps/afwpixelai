const fs = require('fs');
let content = fs.readFileSync('index.tsx', 'utf8');

const replacement = `  msmeRegistration: "UDYAM-RJ-14-0018404",
  poweredBy: "Askforwrite Digital",
  email: "info@askforwrite.com",
  website: "www.askforwrite.com",
  upiId: "vipulchobisa@okicici",
};

const PROMPT_TEMPLATES = {
  identity: "Keep the same face, hair style, and face direction as the reference image. Maintain subject identity completely unchanged. Generate a hyper-realistic photography portrait while keeping original face, expressions, and natural features completely unchanged.",
  lens: "To create a portrait with a telephoto lens, use a focal length between 85mm and 200mm to compress features and achieve a pleasing background blur (bokeh). Note: Ensure the generated image is genuine based on authentic real-world sources and benchmarks as per best photographers, and is competitive to the best of 0.1% generative models research queries.",
  restoration: "Professional high-end photo restoration, fix scratches, denoise, sharpen, color correct, maintain original details and perfect face/body identity, hyper-realistic, 8k."
};

const EFFECTS_LIBRARY = [
  { id: "effect_1", name: "Venetian Red", desc: "A young girl in a Venetian red dress with delicate white lace kneeling beneath an ancient oak tree at golden hour.", icon: "fa-tree", type: "artistic", category: "Cinematic" },
  { id: "effect_2", name: "Meadow Run", desc: "A girl with hair flowing freely, smiles radiantly whilst playfully running through a multicolored meadow.", icon: "fa-sun", type: "artistic", category: "Cinematic" },
  { id: "effect_3", name: "Wildflower Bliss"`;

const regex = /  msmeRegistration: "UDYAM-RJ-14-0018404",[\s\S]*?\{ id: "effect_3", name: "Wildflower Bliss"/;

content = content.replace(regex, replacement);

fs.writeFileSync('index.tsx', content, 'utf8');
console.log('Fixed prompts successfully');
