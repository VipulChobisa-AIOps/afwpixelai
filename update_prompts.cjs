const fs = require('fs');
const path = require('path');
const indexFile = path.join(__dirname, 'index.tsx');
let content = fs.readFileSync(indexFile, 'utf8');

const newPromptTemplates = `const PROMPT_TEMPLATES = {
  identity: "keep the same face and face direction reference image, maintain subject identity. Using the uploaded image, generate a hyper-realistic photography portrait while keeping the original face, expressions, and natural features completely unchanged.",
  lens: "keep the same face as reference image, hair style and face direction reference image, maintain subject identity. To create a portrait with a telephoto lens, use a focal length between 85mm and 200mm to compress features and achieve a pleasing background blur (bokeh). Note: I hope your generated image is genuine based on authentic realworld sources and benchmarks as per best photographers, also it should be competitive to best of 0.1% generative models research quaries.",
  restoration: \`Restore and complete this old, torn, incomplete photograph with extreme realism and emotional accuracy.
Detect and reconstruct missing facial features and body parts perfectly, preserving identity, bone structure, proportions, and natural expression.
Maintain original skin tone, natural texture, wrinkles, imperfections, historical clothing, background, and emotional warmth.
Keep a vintage aesthetic with natural film grain, soft tones, and authentic era-correct lighting. Protect the emotional story and personality captured in the original.
This is a family memory restoration; treat with dignity and love. Maintain authenticity — do not modernize or beautify unnaturally.
Preserve original emotional energy, gentle warmth in the eyes, natural smile or expression, and subtle nostalgia.
Ultra-realistic face recovery, emotional preservation mode.
Old film texture, true grain, soft tonal balance.
Historical accuracy filter: ON.
Family memory preservation priority.
Respectful deceased loved-one restoration approach.
Technical Target: <0.01% error tolerance in facial identity, emotional tone, and proportions.
Goal: Restore as if the photo was never damaged — timeless, gentle, personal, and historically accurate.
Facial Structure Reconstruction
Analyze incomplete areas.
Rebuild facial structure (eyes, nose, mouth, jawline, ears, hairline) using identity logic, symmetry, bone anatomy, age-accurate realism, and emotional continuity.
Model Behavior Settings
Identity Lock: ON
Emotional Fidelity: HIGH
Historic Texture: Vintage/Film
Grain Authenticity: Natural
Memory-Respect Mode: Enabled
Photo-Integrity Guard: Maximum
Do not alter identity, expressions, age, or emotion. No AI plastic skin, filters, airbrush, uncanny features, digital glow, makeup, modern elements, incorrect anatomy, or fantasy stylization. No smoothing, beautification, cartoon texture, blur patches, or artifacts. Do not invent unrealistic features or backgrounds.\`
};`;

const effectsRaw = require('./effects_90.json');
const customEffect = {
  id: "custom_prompt",
  name: "Custom Prompt",
  desc: "Type your own prompt to edit the image.",
  isPro: false,
  icon: "fa-solid fa-pen-nib",
  color: "from-blue-500 to-indigo-500"
};
const restoreEffect = {
  id: "restoration",
  name: "Photo Restoration",
  desc: "AI-powered restoration for old or damaged photos.",
  isPro: true,
  icon: "fa-solid fa-wand-magic-sparkles",
  color: "from-amber-500 to-orange-500"
};

const newEffectsLibrary = `const EFFECTS_LIBRARY = [\n  ${JSON.stringify(customEffect)},\n  ${JSON.stringify(restoreEffect)},\n` +
  effectsRaw.map((e, i) => `  { id: "effect_${i+1}", name: "Effect ${i+1}", desc: ${JSON.stringify(e.desc)}, isPro: ${(i+1)>10}, icon: "fa-solid fa-image", color: "from-purple-500 to-pink-500" }`).join(',\n') +
  `\n];`;

// Replace PROMPT_TEMPLATES
content = content.replace(/const PROMPT_TEMPLATES = \{[\s\S]*?\n\};\n/m, newPromptTemplates + '\n\n');

// Replace EFFECTS_LIBRARY
content = content.replace(/const EFFECTS_LIBRARY = \[[\s\S]*?\n\];\n/m, newEffectsLibrary + '\n\n');

fs.writeFileSync(indexFile, content, 'utf8');
console.log('Successfully updated PROMPT_TEMPLATES and EFFECTS_LIBRARY');
