import React, { useState, useRef, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { GoogleGenAI } from "@google/genai";
import JSZip from "jszip";

// --- Configuration & Constants ---

const APP_CONFIG = {
  appName: "afwPixelAi",
  version: "1.4.5",
  msmeRegistration: "UDYAM-RJ-14-0018404",
  poweredBy: "Askforwrite Digital",
};

const PROMPT_TEMPLATES = {
  identity: "keep the same face, age, and face direction reference image, maintain subject identity. Using the uploaded image, generate a hyper-realistic photography portrait while keeping the subject's original face, age, expressions, and natural features completely unchanged. Do not change the person's age; preserve it exactly as seen in the reference image.",
  lens: "keep the same face as reference image, hair style and face direction reference image, maintain subject identity. To create a portrait with a telephoto lens, use a focal length between 85mm and 200mm to compress features and achieve a pleasing background blur (bokeh). Note: The generated image should be genuine based on authentic realworld sources and benchmarks as per best photographers, also it should be competitive to best of 0.1% generative models research queries.",
  restoration: "Professional high-end photo restoration, fix scratches, denoise, sharpen, color correct, maintain original details and face identity, hyper-realistic, 8k."
};

const EFFECTS_LIBRARY = [
  { 
    id: "custom_prompt", 
    name: "Custom Prompt", 
    desc: "Type your own prompt to edit the image.", 
    icon: "fa-keyboard", 
    type: "utility" 
  },
  { 
    id: "restoration", 
    name: "AI Restoration", 
    desc: "Fix scratches, denoise, sharpen, and color correct.", 
    icon: "fa-wand-magic-sparkles",
    type: "utility"
  },
  { 
    id: "effect_1", 
    name: "Venetian Red", 
    desc: "Young girl in a Venetian red dress with delicate white lace kneeling beneath an ancient oak tree, golden hour sunlight, spaniel puppy.", 
    icon: "fa-dog",
    type: "artistic"
  },
  { 
    id: "effect_2", 
    name: "Meadow Run", 
    desc: "Radiantly smiling while playfully running through a multicolored meadow filled with wildflowers at golden hour.", 
    icon: "fa-sun",
    type: "artistic"
  },
  { 
    id: "effect_3", 
    name: "Wildflower Bliss", 
    desc: "Standing amidst a kaleidoscope of wildflowers, arms spread wide, basking in golden late afternoon light.", 
    icon: "fa-leaf",
    type: "artistic"
  },
  { 
    id: "effect_4", 
    name: "Dutch Portrait", 
    desc: "Traditional brown folk attire holding a single white flower, Prussian blue background, Rembrandt lighting.", 
    icon: "fa-palette",
    type: "artistic"
  },
  { 
    id: "effect_5", 
    name: "Chalkboard Dance", 
    desc: "Ballet dancer in a vivid red leotard against a dark chalkboard backdrop, showcasing poise and dedication.", 
    icon: "fa-chalkboard",
    type: "artistic"
  },
  { 
    id: "effect_6", 
    name: "Weightless Leap", 
    desc: "Young ballerina performing a stunning leap, concentrated expression, light playing off the tutu.", 
    icon: "fa-person-running",
    type: "artistic"
  },
  { 
    id: "effect_7", 
    name: "Flamenco Swirl", 
    desc: "Swirl of motion, hair flowing, flamenco-inspired red and black dress, pure joy.", 
    icon: "fa-fan",
    type: "artistic"
  },
  { 
    id: "effect_8", 
    name: "Rainbow Tutu", 
    desc: "Twirling in a rainbow-hued tutu dress, beaming smile, warm ambient lighting.", 
    icon: "fa-child-reaching",
    type: "artistic"
  },
  { 
    id: "effect_9", 
    name: "Dandelion Dance", 
    desc: "Twirling in a meadow with a vibrant rainbow tutu and soft glimmer of floating dandelions at sunset.", 
    icon: "fa-wind",
    type: "artistic"
  },
  { 
    id: "effect_10", 
    name: "Spring Jubilation", 
    desc: "Arms up in jubilation amidst a field of blooming flowers, bright floral dress, springtime splendor.", 
    icon: "fa-seedling",
    type: "artistic"
  },
  { 
    id: "effect_11", 
    name: "Water Park Fun", 
    desc: "Arms raised high in a bright red dress at a water park, splashes of water enveloping in carefree bliss.", 
    icon: "fa-water",
    type: "artistic"
  },
  { 
    id: "effect_12", 
    name: "Pool Splashes", 
    desc: "Raising arms amidst sparkling waters of a pool, vibrant energy, pure childhood bliss.", 
    icon: "fa-droplet",
    type: "artistic"
  },
  { 
    id: "effect_13", 
    name: "Bokeh Water", 
    desc: "Playing in water, droplets as sparkling highlights against a soft bokeh background, carefree magic.", 
    icon: "fa-circle-dot",
    type: "artistic"
  },
  { 
    id: "effect_14", 
    name: "Playground Slide", 
    desc: "Wearing an orange jacket playing on a vividly painted slide, radiant happiness.", 
    icon: "fa-play",
    type: "artistic"
  },
  { 
    id: "effect_15", 
    name: "Kite Beach", 
    desc: "Flying a vibrant kite on soft sand under a vast clear sky, gentle sea breeze.", 
    icon: "fa-umbrella-beach",
    type: "artistic"
  },
  { 
    id: "effect_16", 
    name: "Kite Festival", 
    desc: "Dashing through a vibrant kite festival, sky as a mosaic of colors, carefree sprint.", 
    icon: "fa-wind",
    type: "artistic"
  },
  { 
    id: "effect_17", 
    name: "Fairground Wonder", 
    desc: "Surrounded by a kaleidoscope of brightly painted signs at an amusement park, sparkling eyes.", 
    icon: "fa-map",
    type: "artistic"
  },
  { 
    id: "effect_18", 
    name: "Carousel Ride", 
    desc: "Perched atop an ornately decorated carousel horse, spinning colors, whimsical backdrop.", 
    icon: "fa-horse-head",
    type: "artistic"
  },
  { 
    id: "effect_19", 
    name: "Orange Slide", 
    desc: "Sliding down a vibrant orange slide, beaming smile, wide eyes, pure excitement.", 
    icon: "fa-angles-down",
    type: "artistic"
  },
  { 
    id: "effect_20", 
    name: "Meadow Dance", 
    desc: "Two young girls dancing together in a tranquil meadow bathed in golden sunlight.", 
    icon: "fa-music",
    type: "artistic"
  },
  { 
    id: "effect_21", 
    name: "Forest Path", 
    desc: "Running through a sun-dappled path surrounded by lush greenery, vibrant floral dresses.", 
    icon: "fa-tree",
    type: "artistic"
  },
  { 
    id: "effect_22", 
    name: "Butterfly Lamp", 
    desc: "Whimsical tutu, gazing at a lamp post attracting a magnificent butterfly under a starlit sky.", 
    icon: "fa-bug",
    type: "artistic"
  },
  { 
    id: "effect_23", 
    name: "Magic Umbrella", 
    desc: "Tranquil evening walk under a golden lamppost with a vibrant umbrella and whimsical butterflies.", 
    icon: "fa-umbrella",
    type: "artistic"
  },
  { 
    id: "effect_24", 
    name: "Fairytale Creature", 
    desc: "Whimsical creature with butterfly wings resting against an old-fashioned lamppost, warm glow.", 
    icon: "fa-dragon",
    type: "artistic"
  },
  { 
    id: "effect_25", 
    name: "Firefly Twilight", 
    desc: "Holding a jar of fireflies amidst an ethereal twilight glow, fairy-tale luminescence.", 
    icon: "fa-lightbulb",
    type: "artistic"
  },
  { 
    id: "effect_26", 
    name: "Magical Present", 
    desc: "Opening a magical present with golden sparkles spilling out, Christmas tree bokeh in background.", 
    icon: "fa-gift",
    type: "artistic"
  },
  { 
    id: "effect_27", 
    name: "Toy Village", 
    desc: "Exploring a tiny toy village in a lush garden at sunset, world of imagination.", 
    icon: "fa-house-chimney",
    type: "artistic"
  },
  { 
    id: "effect_28", 
    name: "Ribbon Dance", 
    desc: "Dancing with colorful ribbons through a sunlit park at sunset, spirited freedom.", 
    icon: "fa-ribbon",
    type: "artistic"
  },
  { 
    id: "effect_29", 
    name: "Rainbow Ribbon", 
    desc: "Twirling a rainbow-colored ribbon in a grassy field at golden hour.", 
    icon: "fa-wand-sparkles",
    type: "artistic"
  },
  { 
    id: "effect_30", 
    name: "Sandcastle Focus", 
    desc: "Deeply absorbed in constructing an elaborate sandcastle, intense focus, creative passion.", 
    icon: "fa-castle",
    type: "artistic"
  },
  { 
    id: "effect_31", 
    name: "Beach Sandcastle", 
    desc: "Two children building a magnificent sandcastle on a pristine beach under clear blue skies.", 
    icon: "fa-trowel-bricks",
    type: "artistic"
  },
  { 
    id: "effect_32", 
    name: "Bucket Hat Beach", 
    desc: "Building sandcastles on a vibrant beach, wearing a colorful bucket hat, radiant smile.", 
    icon: "fa-hat-cowboy",
    type: "artistic"
  },
  { 
    id: "effect_33", 
    name: "Candlelight Pool", 
    desc: "Tranquil pool with floating candles, lily pads, and starfish at twilight, magical glow.", 
    icon: "fa-fire-flame-curved",
    type: "artistic"
  },
  { 
    id: "effect_34", 
    name: "Lantern Festival", 
    desc: "Leading the way through a field during a lantern festival, clutching a glowing lantern.", 
    icon: "fa-paper-plane",
    type: "artistic"
  },
  { 
    id: "effect_35", 
    name: "Field Race", 
    desc: "Running through a field of tall grass at golden hour, holding a bottle, carefree spirit.", 
    icon: "fa-person-running",
    type: "artistic"
  },
  { 
    id: "effect_36", 
    name: "Glowing Lantern", 
    desc: "Running through a tall grassy field with a glowing orange lantern, magical atmosphere.", 
    icon: "fa-bolt",
    type: "artistic"
  },
  { 
    id: "effect_37", 
    name: "Cultural Dance", 
    desc: "Dancing in colorful cultural attire with intricate patterns and vibrant feathers, festive energy.", 
    icon: "fa-masks-theater",
    type: "artistic"
  },
  { 
    id: "effect_38", 
    name: "Birthday Wish", 
    desc: "Leaning forward towards a birthday cake with numerous glowing candles, anticipation.", 
    icon: "fa-cake-candles",
    type: "artistic"
  },
  { 
    id: "effect_39", 
    name: "Party Celebration", 
    desc: "Blowing out candles on a sprinkle-covered cake, balloons and party decorations.", 
    icon: "fa-gift",
    type: "artistic"
  },
  { 
    id: "effect_40", 
    name: "Cake Moment", 
    desc: "Making a wish before blowing out candles on a sprinkle-covered cake, surrounded by friends.", 
    icon: "fa-face-smile-beam",
    type: "artistic"
  },
  { 
    id: "effect_41", 
    name: "Lantern Night", 
    desc: "Gently grasping a glowing orange lantern in a tall grassy field at sunset.", 
    icon: "fa-star",
    type: "artistic"
  },
  { 
    id: "effect_42", 
    name: "Treehouse Friend", 
    desc: "Sharing a moment with an adorable fluffy white dog on a blanket, enchanting treehouse background.", 
    icon: "fa-dog",
    type: "artistic"
  },
  { 
    id: "effect_43", 
    name: "Garden Tea Party", 
    desc: "Tea party with a fluffy dog on a lush green lawn, surrounded by pink blossoms.", 
    icon: "fa-mug-hot",
    type: "artistic"
  },
  { 
    id: "effect_44", 
    name: "Tutu Treehouse", 
    desc: "Soft pink tutu dress, sharing a serene moment with a fluffy companion near a wooden treehouse.", 
    icon: "fa-house",
    type: "artistic"
  },
  { 
    id: "effect_45", 
    name: "Heather Meadow", 
    desc: "Sitting in a field of heather with a loyal canine companion, warm knit hat and scarf.", 
    icon: "fa-dog",
    type: "artistic"
  },
  { 
    id: "effect_46", 
    name: "Golden Retriever", 
    desc: "Leaning closely behind a golden retriever in a field at golden hour, pure connection.", 
    icon: "fa-paw",
    type: "artistic"
  },
  { 
    id: "effect_47", 
    name: "Jar of Stars", 
    desc: "Holding a jar brimming with golden lights like captured stars, aura of mystery.", 
    icon: "fa-wand-magic",
    type: "artistic"
  },
  { 
    id: "effect_48", 
    name: "Midsummer Dream", 
    desc: "Glass jar with warm golden light, midsummer night's dream atmosphere, magical glow.", 
    icon: "fa-moon",
    type: "artistic"
  },
  { 
    id: "effect_49", 
    name: "Meadow Twirl", 
    desc: "Twirling outdoors in a colorful flowing dress, wildflowers, dreamy overcast sky.", 
    icon: "fa-clover",
    type: "artistic"
  },
  { 
    id: "effect_50", 
    name: "Traditional Performance", 
    desc: "Traditional dance with a colorful flowing skirt, guitar player in background.", 
    icon: "fa-guitar",
    type: "artistic"
  },
  { 
    id: "effect_51", 
    name: "Festival Twirl", 
    desc: "Mid-twirl in a traditional red costume with floral details, festival surroundings.", 
    icon: "fa-burst",
    type: "artistic"
  },
  { 
    id: "effect_52", 
    name: "Heritage Dance", 
    desc: "Participating in a dance celebration in colorful traditional attire, evening lights.", 
    icon: "fa-people-group",
    type: "artistic"
  },
  { 
    id: "effect_53", 
    name: "Vibrant Dress", 
    desc: "Joyful mid-twirl, vibrant multicolored dress flaring out, carefree bliss.", 
    icon: "fa-shirt",
    type: "artistic"
  },
  { 
    id: "effect_54", 
    name: "Rainbow Spin", 
    desc: "Mid-twirl in a colorful tutu fanning out like a rainbow, sunlit dance studio.", 
    icon: "fa-rainbow",
    type: "artistic"
  },
  { 
    id: "effect_55", 
    name: "Studio Grace", 
    desc: "Aspiring ballerina in a white tutu striking an elegant pose in a sunlit studio.", 
    icon: "fa-person-dress",
    type: "artistic"
  },
  { 
    id: "effect_56", 
    name: "Ballet Leap", 
    desc: "Mid-air during a ballet leap, flowing peach tutu, focus and grace.", 
    icon: "fa-wind",
    type: "artistic"
  },
  { 
    id: "effect_57", 
    name: "Fairy Light Studio", 
    desc: "Poised by the ballet barre in a blue and pink outfit, studio filled with fairy lights.", 
    icon: "fa-lightbulb",
    type: "artistic"
  },
  { 
    id: "effect_58", 
    name: "Elegant Practice", 
    desc: "Pink tutu, practicing in a studio with soft glowing chandeliers and mirror-lined walls.", 
    icon: "fa-gem",
    type: "artistic"
  },
  { 
    id: "effect_59", 
    name: "Balloon Confetti", 
    desc: "Strolling through a festive scene with myriad balloons and confetti, patterned dress.", 
    icon: "fa-face-grin-stars",
    type: "artistic"
  },
  { 
    id: "effect_60", 
    name: "Ice Cream Summer", 
    desc: "Sunflower in hair, holding an ice cream cone, radiant smile, summer essence.", 
    icon: "fa-ice-cream",
    type: "artistic"
  },
  { 
    id: "effect_61", 
    name: "Stained Glass", 
    desc: "White lace dress, flower crown, holding an ornate book in a place of worship with stained glass.", 
    icon: "fa-book-open",
    type: "artistic"
  },
  { 
    id: "effect_62", 
    name: "Singing Festival", 
    desc: "Singing with gusto in a colorful traditional dress at a communal cultural festival.", 
    icon: "fa-microphone",
    type: "artistic"
  },
  { 
    id: "effect_63", 
    name: "Strawberry Harvest", 
    desc: "Holding a wicker basket of large luscious strawberries, white shirt, patterned skirt.", 
    icon: "fa-basket-shopping",
    type: "artistic"
  },
  { 
    id: "effect_64", 
    name: "Rose Gown", 
    desc: "Flowing dusty rose gown with billowing sleeves, soft golden window light, ethereal.", 
    icon: "fa-wind",
    type: "artistic"
  },
  { 
    id: "effect_65", 
    name: "Candy Floss", 
    desc: "Holding a massive fluffy stick of candy floss at a fairground with glowing lights.", 
    icon: "fa-candy-cane",
    type: "artistic"
  },
  { 
    id: "effect_66", 
    name: "Carousel Pole", 
    desc: "Clinging to a bright carousel pole at a fairground, golden hour light, wonder.", 
    icon: "fa-horse",
    type: "artistic"
  },
  { 
    id: "effect_67", 
    name: "Watermelon Slice", 
    desc: "Savoring a fresh slice of watermelon, sunlight filtering through lush greenery.", 
    icon: "fa-lemon",
    type: "artistic"
  },
  { 
    id: "effect_68", 
    name: "Flower Headdress", 
    desc: "Colorful traditional attire, flower headdress, living embodiment of cultural festivities.", 
    icon: "fa-clover",
    type: "artistic"
  },
  { 
    id: "effect_69", 
    name: "Birthday Princess", 
    desc: "Glittering crown, fifth birthday celebration in a garden, beautifully wrapped presents.", 
    icon: "fa-crown",
    type: "artistic"
  },
  { 
    id: "effect_70", 
    name: "Rope Swing", 
    desc: "Swinging beneath a canopy of green leaves, sun illuminating flowing hair, carefree.", 
    icon: "fa-link",
    type: "artistic"
  },
  { 
    id: "effect_71", 
    name: "Confetti Balloons", 
    desc: "Curly blonde hair, lifting arms in delight with a cluster of confetti balloons.", 
    icon: "fa-face-grin-squint",
    type: "artistic"
  },
  { 
    id: "effect_72", 
    name: "Golden Twirl", 
    desc: "Golden hour sunlight, mid-twirl, genuine laughter, soft-focus natural background.", 
    icon: "fa-sun",
    type: "artistic"
  },
  { 
    id: "effect_73", 
    name: "Coral Abandon", 
    desc: "Twirling with abandon in a vibrant coral dress against a sky blue background.", 
    icon: "fa-cloud",
    type: "artistic"
  },
  { 
    id: "effect_74", 
    name: "Jubilant Chase", 
    desc: "Charging forward in a field at golden hour, friends in a jubilant chase.", 
    icon: "fa-bolt-lightning",
    type: "artistic"
  },
  { 
    id: "effect_75", 
    name: "Open Arms", 
    desc: "Standing in a blooming field with arms open wide, floral dress, sunset warmth.", 
    icon: "fa-heart",
    type: "artistic"
  },
  { 
    id: "effect_76", 
    name: "Horse Connection", 
    desc: "Majestic horse, gentle touch, countryside background, bond of friendship and trust.", 
    icon: "fa-horse",
    type: "artistic"
  },
  { 
    id: "effect_77", 
    name: "Sunset Horse", 
    desc: "Delicate white dress, serene connection with a majestic horse at sunset.", 
    icon: "fa-mountain-sun",
    type: "artistic"
  },
  { 
    id: "effect_78", 
    name: "Swing Delight", 
    desc: "Exuberant delight on a swing, hair flying wildly, setting sun warmth.", 
    icon: "fa-face-grin-tears",
    type: "artistic"
  },
  { 
    id: "effect_79", 
    name: "Sunflower Delight", 
    desc: "Lush sunflower field, curly hair, ethereal golden light at sunset.", 
    icon: "fa-sun",
    type: "artistic"
  },
  { 
    id: "effect_80", 
    name: "Meadow Bubble", 
    desc: "Mosaic of wildflowers, floating bubble, childhood innocence, serene light.", 
    icon: "fa-soap",
    type: "artistic"
  },
  { 
    id: "effect_81", 
    name: "Wildflower Walk", 
    desc: "Walking through an untamed meadow of wildflowers at sunset, tranquility.", 
    icon: "fa-person-walking",
    type: "artistic"
  },
  { 
    id: "effect_82", 
    name: "Flower Happiness", 
    desc: "Infectious laugh amidst a field of flowers, arms outstretched, golden hour.", 
    icon: "fa-face-laugh-beam",
    type: "artistic"
  },
  { 
    id: "effect_83", 
    name: "Field Sprint", 
    desc: "Running towards the camera through a field of tall grass, joyful smile, golden glow.", 
    icon: "fa-person-running",
    type: "artistic"
  },
  { 
    id: "effect_84", 
    name: "Shore Dash", 
    desc: "Vibrant red dress, dashing along the shore at sunset, sea breeze.", 
    icon: "fa-water",
    type: "artistic"
  },
  { 
    id: "effect_85", 
    name: "Toy Car Dusk", 
    desc: "Riding a toy car along the water's edge at dusk, golden hue, whimsy.", 
    icon: "fa-car",
    type: "artistic"
  },
  { 
    id: "effect_86", 
    name: "Cobblestone Fun", 
    desc: "Four children running down a historic cobblestone street, laughter and freedom.", 
    icon: "fa-people-group",
    type: "artistic"
  },
  { 
    id: "effect_87", 
    name: "Yellow Blooms", 
    desc: "Frolicking through a vibrant field of yellow blooms, floral dress, pure bliss.", 
    icon: "fa-sun",
    type: "artistic"
  },
  { 
    id: "effect_88", 
    name: "High Leap", 
    desc: "Leaping high above a sea of blooming flowers, brilliant blue sky, spirited.", 
    icon: "fa-arrow-up",
    type: "artistic"
  },
  { 
    id: "effect_89", 
    name: "Wildflower Dream", 
    desc: "Standing amidst a kaleidoscope of wildflowers, arms spread wide, dreamy atmosphere.", 
    icon: "fa-cloud-sun",
    type: "artistic"
  },
  { 
    id: "effect_90", 
    name: "Wild Abandon", 
    desc: "Leaping with wild abandon among a field of colorful wildflowers, yellow dress.", 
    icon: "fa-bolt",
    type: "artistic"
  }
];

// --- AI Service ---

const generateAiImage = async (originalBase64: string, effectId: string, customPromptText?: string): Promise<string> => {
  const apiKey = localStorage.getItem('gemini_api_key') || process.env.API_KEY || process.env.GEMINI_API_KEY || "";
  
  if (!apiKey) {
    console.warn("No Gemini API key found in localStorage or environment variables.");
  }
  
  const ai = new GoogleGenAI({ apiKey });
  
  const effect = EFFECTS_LIBRARY.find(e => e.id === effectId);
  if (!effect) throw new Error("Effect not found");

  let finalPrompt = "";
  
  if (effect.id === 'restoration') {
    finalPrompt = PROMPT_TEMPLATES.restoration;
  } else if (effect.id === 'custom_prompt') {
    finalPrompt = `${PROMPT_TEMPLATES.identity} ${PROMPT_TEMPLATES.lens} Edit this image as follows: ${customPromptText || "Enhance the image"}`;
  } else {
    finalPrompt = `${PROMPT_TEMPLATES.identity} ${PROMPT_TEMPLATES.lens} Edit this image as follows: ${effect.desc}`;
  }

  const base64Data = originalBase64.split(',')[1];

  const modelsToTry = [
    'gemini-2.5-flash-image',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-2.0-flash-exp',
    'gemini-2.0-pro-exp-02-05',
    'imagen-4.0-generate-001',
    'imagen-4.0-fast-generate-001',
    'imagen-3.0-generate-001',
    'imagen-3.0-fast-generate-001',
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash',
    'gemini-1.5-flash-8b',
    'gemini-1.5-pro-latest',
    'gemini-1.5-pro',
    'gemini-pro-vision',
    'gemini-1.0-pro-vision'
  ];

  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`Attempting generation with ${modelName}...`);
      const response = await ai.models.generateContent({
        model: modelName,
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: 'image/jpeg', 
                data: base64Data
              }
            },
            { text: finalPrompt }
          ]
        }
      });

      const parts = response.candidates?.[0]?.content?.parts;
      if (!parts) throw new Error(`No content generated by ${modelName}`);

      for (const part of parts) {
          if (part.inlineData) {
              return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          }
      }
      
      const textPart = parts.find(p => p.text);
      if (textPart) {
          console.warn(`Model ${modelName} returned text:`, textPart.text);
      }
    } catch (error: any) {
      console.warn(`${modelName} failed:`, error);
      lastError = error;
    }
  }

  throw lastError || new Error("All AI models failed to generate an image. Please verify your Gemini API key in settings.");
};

// --- Components ---

const Logo = ({ customSrc }: { customSrc?: string | null }) => {
    const [hasError, setHasError] = useState(false);
    // Strictly use the assets path or custom upload
    const src = customSrc || "assets/logo.png";

    useEffect(() => {
        setHasError(false);
    }, [src]);

    return (
        <div className="w-12 h-12 rounded-xl bg-blue-950 flex items-center justify-center overflow-hidden shadow-lg border border-blue-900/50">
             {!hasError ? (
                 <img 
                    src={src} 
                    alt="afw Logo" 
                    className="w-full h-full object-contain"
                    onError={() => setHasError(true)}
                 />
             ) : (
                <span className="text-2xl font-serif italic font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 pb-1">afw</span>
             )}
        </div>
    );
};

const Header = ({ customLogo }: { customLogo?: string | null }) => (
  <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
    <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Logo customSrc={customLogo} />
        <div>
          <h1 className="text-2xl font-bold tracking-tight leading-none">
             {/* Tech white for Pixel, Fire gradient for Ai */}
            <span className="text-slate-100">Pixel</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500">Ai</span>
          </h1>
          <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase">
            Img Studio
          </span>
        </div>
      </div>
      <div className="hidden sm:flex items-center gap-4 text-xs font-medium text-slate-400">
        <span><i className="fa-solid fa-shield-halved mr-1 text-slate-600"></i>Identity Lock™</span>
        <span><i className="fa-solid fa-camera mr-1 text-slate-600"></i>Cinematic Lens</span>
      </div>
    </div>
  </header>
);

const Footer = () => (
  <footer className="bg-slate-950 text-slate-500 py-6 text-center text-xs mt-auto border-t border-slate-900">
    <p className="mb-2">
      <span className="font-semibold text-slate-400">Powered by {APP_CONFIG.poweredBy}</span>
    </p>
    <p className="opacity-60 font-mono">
      MSME Registered: {APP_CONFIG.msmeRegistration}
    </p>
    <div className="mt-4 flex justify-center gap-4 opacity-50">
      <i className="fa-brands fa-instagram hover:text-white cursor-pointer transition-colors"></i>
      <i className="fa-brands fa-twitter hover:text-white cursor-pointer transition-colors"></i>
      <i className="fa-solid fa-globe hover:text-white cursor-pointer transition-colors"></i>
    </div>
  </footer>
);

interface EffectCardProps {
  effect: any;
  isSelected: boolean;
  onClick: () => void;
}

const EffectCard: React.FC<EffectCardProps> = ({ effect, isSelected, onClick }) => (
  <button
    onClick={onClick}
    className={`
      flex flex-col items-center justify-center p-2 rounded-xl border transition-all duration-200 w-full aspect-square text-center group relative overflow-hidden
      ${isSelected 
        ? 'border-orange-500 bg-orange-900/20 shadow-md ring-1 ring-orange-500/50' 
        : 'border-slate-700 bg-slate-800 hover:border-slate-600 hover:bg-slate-700'
      }
    `}
    title={effect.desc}
  >
    <div className={`
      w-8 h-8 rounded-lg flex items-center justify-center mb-1 text-md transition-colors
      ${isSelected ? 'bg-orange-500 text-white' : 'bg-slate-700 text-slate-400 group-hover:bg-slate-600 group-hover:text-slate-200'}
    `}>
      <i className={`fa-solid ${effect.icon}`}></i>
    </div>
    <h3 className={`font-bold text-[10px] leading-tight line-clamp-2 ${isSelected ? 'text-slate-200' : 'text-slate-400 group-hover:text-slate-300'}`}>
      {effect.name}
    </h3>
  </button>
);

// --- Main Application ---

const App = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [selectedEffectId, setSelectedEffectId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  
  const [customPromptText, setCustomPromptText] = useState("");
  const [customLogo, setCustomLogo] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check for ZIP file
    if (file.name.endsWith('.zip') || file.type === 'application/zip' || file.type === 'application/x-zip-compressed') {
        setError(null);
        try {
            const zip = new JSZip();
            const contents = await zip.loadAsync(file);
            
            let foundLogo = false;
            let foundImage = false;
            
            // 1. Look for logo.png (insensitive)
            const fileNames = Object.keys(contents.files);
            const logoFileName = fileNames.find(name => name.toLowerCase().includes('logo.png') && !contents.files[name].dir);
            
            if (logoFileName) {
                const logoBlob = await contents.files[logoFileName].async('blob');
                const logoUrl = URL.createObjectURL(logoBlob);
                setCustomLogo(logoUrl);

                // --- DYNAMIC FAVICON UPDATE ---
                const iconLinks = document.querySelectorAll("link[rel*='icon']");
                iconLinks.forEach(link => (link as HTMLLinkElement).href = logoUrl);
                
                if (iconLinks.length === 0) {
                    const link = document.createElement('link');
                    link.rel = 'icon';
                    link.href = logoUrl;
                    document.head.appendChild(link);
                }
                
                foundLogo = true;
            }

            // 2. Look for the first valid image
            const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
            const imageFileName = fileNames.find(name => {
                const lower = name.toLowerCase();
                const isImage = validExtensions.some(ext => lower.endsWith(ext));
                const isNotLogo = !lower.includes('logo.png');
                const isNotDir = !contents.files[name].dir;
                return isImage && isNotLogo && isNotDir;
            });

            if (imageFileName) {
                const imgBlob = await contents.files[imageFileName].async('blob');
                setOriginalImage(URL.createObjectURL(imgBlob));
                setResultImage(null);
                foundImage = true;
            }
            
            if (!foundLogo && !foundImage) {
                setError("ZIP file loaded but no valid images or logo.png found.");
            } else if (foundLogo && !foundImage) {
                setError(null);
            }

        } catch (err: any) {
            console.error("Zip Error:", err);
            setError("Failed to process ZIP file.");
        }
    } else {
        // Handle Standard Image
        const reader = new FileReader();
        reader.onload = (event) => {
          setOriginalImage(event.target?.result as string);
          setResultImage(null);
          setError(null);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleDemoLoad = async () => {
    setIsLoadingDemo(true);
    setError(null);
    try {
        const response = await fetch("https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80");
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
            setOriginalImage(reader.result as string);
            setResultImage(null);
            setError(null);
            setIsLoadingDemo(false);
        }
        reader.readAsDataURL(blob);
    } catch (e) {
        setError("Failed to load demo image.");
        setIsLoadingDemo(false);
    }
  };

  const handleGenerate = async () => {
    if (!originalImage || !selectedEffectId) return;

    setIsGenerating(true);
    setError(null);
    
    try {
      const generated = await generateAiImage(originalImage, selectedEffectId, customPromptText);
      setResultImage(generated);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('429') || err.message?.includes('quota') || err.message?.includes('RESOURCE_EXHAUSTED') || err.status === 429) {
          setError("QUOTA_EXCEEDED");
      } else {
          // Display generic error to user to avoid system-like error text
          setError("Failed to generate image. Please try again.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    const targetImage = resultImage || originalImage;
    if (!targetImage) return;

    const filename = `afwPixelAi_${Date.now()}.png`;

    try {
      // 1. Native Capacitor Filesystem save if running as native app
      if ((window as any).Capacitor?.isNativePlatform?.()) {
        const base64Data = targetImage.includes(',') ? targetImage.split(',')[1] : targetImage;
        const savedFile = await Filesystem.writeFile({
          path: filename,
          data: base64Data,
          directory: Directory.Documents
        });
        alert(`Image saved successfully to Documents folder: ${savedFile.uri}`);
        return;
      }

      // 2. Web Browser Blob Download
      const res = await fetch(targetImage);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    } catch (err) {
      console.error("Download failed, using direct link fallback:", err);
      const link = document.createElement("a");
      link.href = targetImage;
      link.download = filename;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShare = async () => {
    if (!resultImage) return;

    const confirmed = window.confirm("Are you sure you want to share this image?");
    if (!confirmed) return;

    try {
        const base64Response = await fetch(resultImage);
        const blob = await base64Response.blob();
        const file = new File([blob], "afw_art.png", { type: "image/png" });

        if (navigator.share) {
            await navigator.share({
                title: 'Created with afwPixelAi',
                text: 'Check out this cinematic image created with afwPixelAi!',
                files: [file],
            });
        } else {
            // Fallback for desktop browsers that don't support file sharing via navigator.share
            alert("Native sharing is not supported on this device. You can download the image instead.");
        }
    } catch (err) {
        console.error("Share failed:", err);
    }
  };

  const startCompare = () => setIsComparing(true);
  const stopCompare = () => setIsComparing(false);

  const isWorkspace = !!originalImage;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 font-sans text-slate-200 selection:bg-orange-500 selection:text-white">
      <Header customLogo={customLogo} />

      <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-6 flex flex-col">
        
        {!isWorkspace ? (
          // --- Upload Screen ---
          <div className="flex-1 flex flex-col items-center justify-center py-12">
            <div className="text-center max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
                <span className="text-slate-100">Cinematic</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500">Image Effect</span>
              </h2>
              <p className="text-lg text-slate-400 mb-10 leading-relaxed">
                Transform ordinary photos into cinematic masterpieces while maintaining the true identity and expressions of your loved ones.
              </p>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="
                  group relative overflow-hidden rounded-3xl bg-slate-900 border-4 border-dashed border-slate-800 
                  p-12 cursor-pointer transition-all hover:border-orange-500 hover:shadow-xl hover:shadow-orange-900/10 hover:-translate-y-1
                "
              >
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-20 h-20 bg-slate-800 text-blue-500 rounded-full flex items-center justify-center text-3xl mb-6 group-hover:scale-110 group-hover:bg-slate-700 transition-all shadow-inner">
                    <i className="fa-solid fa-cloud-arrow-up"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-200 mb-2">Upload Photo or ZIP</h3>
                  <p className="text-slate-500">Supports images or .zip with logo.png</p>
                </div>
              </div>

              <div className="mt-6">
                  <button 
                    onClick={handleDemoLoad}
                    disabled={isLoadingDemo}
                    className="text-sm font-medium text-slate-500 hover:text-orange-400 transition-colors flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
                  >
                    {isLoadingDemo ? (
                         <i className="fa-solid fa-circle-notch fa-spin"></i>
                    ) : (
                        <i className="fa-solid fa-image"></i>
                    )}
                    Try with Demo Photo
                  </button>
              </div>

              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*,.zip,application/zip,application/x-zip-compressed"
                onChange={handleFileUpload} 
              />
              
              <div className="mt-12 grid grid-cols-3 gap-6 opacity-60">
                <div className="flex flex-col items-center">
                  <i className="fa-solid fa-wand-magic-sparkles text-2xl mb-2 text-slate-600"></i>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">90+ Effects</span>
                </div>
                <div className="flex flex-col items-center">
                  <i className="fa-solid fa-fingerprint text-2xl mb-2 text-slate-600"></i>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Identity Safe</span>
                </div>
                <div className="flex flex-col items-center">
                  <i className="fa-solid fa-download text-2xl mb-2 text-slate-600"></i>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">HD Export</span>
                </div>
              </div>
            </div>
            
            {error && (
                <div className="mt-6 p-3 bg-red-900/20 text-red-400 text-sm rounded-lg border border-red-900/50">
                    <i className="fa-solid fa-circle-exclamation mr-2"></i>{error}
                </div>
            )}
          </div>
        ) : (
          // --- Workspace Screen ---
          <div className="flex flex-col lg:flex-row gap-6 h-full">
            
            {/* Editor Canvas Area (Left) */}
            <div className="flex-1 flex flex-col gap-4">
              <div className="bg-slate-900 rounded-2xl shadow-lg border border-slate-800 overflow-hidden flex-1 relative min-h-[400px] flex items-center justify-center">
                
                {/* Image Container */}
                <div className="relative max-w-full max-h-full p-4 w-full h-full flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                   {/* If Result Exists, handle comparison */}
                   {resultImage ? (
                     <img 
                       src={isComparing ? originalImage : resultImage} 
                       alt="Workspace" 
                       className="max-w-full max-h-full object-contain shadow-2xl rounded-lg animate-fade-in"
                     />
                   ) : (
                     <img 
                       src={originalImage} 
                       alt="Original" 
                       className="max-w-full max-h-full object-contain shadow-xl rounded-lg"
                     />
                   )}

                   {/* Loading Overlay */}
                   {isGenerating && (
                     <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
                       <div className="w-16 h-16 border-4 border-orange-900/50 border-t-orange-500 rounded-full animate-spin mb-4"></div>
                       <p className="text-slate-200 font-bold text-lg animate-pulse">Creating Masterpiece...</p>
                       <p className="text-slate-500 text-sm mt-1">Applying global identity lock</p>
                     </div>
                   )}
                </div>

                {/* Compare Overlay (Bottom Center of Canvas) */}
                {resultImage && !isGenerating && (
                   <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-3 z-10">
                    <button 
                      onMouseDown={startCompare}
                      onMouseUp={stopCompare}
                      onTouchStart={startCompare}
                      onTouchEnd={stopCompare}
                      className="bg-slate-950/90 text-white px-5 py-2.5 rounded-full font-medium text-sm backdrop-blur hover:bg-black transition shadow-lg active:scale-95 select-none border border-slate-800"
                    >
                      <i className="fa-solid fa-eye mr-2"></i>Hold to Compare
                    </button>
                  </div>
                )}
                 
                 {/* Reset Button (Top Right) */}
                 <button 
                    onClick={() => { setOriginalImage(null); setResultImage(null); }}
                    className="absolute top-4 right-4 bg-slate-800/80 p-2 rounded-full text-slate-400 hover:text-red-400 hover:bg-slate-800 transition shadow-sm z-10"
                    title="Close Image"
                 >
                    <i className="fa-solid fa-xmark"></i>
                 </button>
              </div>

              {/* Custom Prompt Input */}
              {selectedEffectId === 'custom_prompt' && (
                <div className="bg-slate-900 rounded-2xl border border-orange-500/50 p-4 shadow-lg">
                  <label className="block text-sm font-bold text-slate-200 mb-2">
                    <i className="fa-solid fa-keyboard mr-2 text-orange-400"></i>
                    Custom Prompt
                  </label>
                  <textarea
                    value={customPromptText}
                    onChange={(e) => setCustomPromptText(e.target.value)}
                    placeholder="e.g., Add a retro filter, Remove the person in the background..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all resize-none h-24"
                  />
                </div>
              )}

              {/* ACTION BAR: Generate, Download, Share (Below Image) */}
              <div className="flex items-center gap-3">
                 <button
                    onClick={handleGenerate}
                    disabled={!selectedEffectId || isGenerating}
                    className={`
                      flex-1 py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center
                      ${!selectedEffectId || isGenerating
                        ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
                        : 'bg-gradient-to-r from-orange-500 to-pink-600 text-white hover:shadow-orange-900/50 hover:from-orange-600 hover:to-pink-700'
                      }
                    `}
                  >
                    {isGenerating ? (
                      <i className="fa-solid fa-circle-notch fa-spin"></i>
                    ) : (
                      <>
                        <i className="fa-solid fa-wand-magic-sparkles mr-2"></i>
                        {resultImage ? 'Regenerate Art' : 'Generate Art'}
                      </>
                    )}
                 </button>

                 <div className="flex gap-2">
                     <button
                        onClick={handleDownload}
                        disabled={!resultImage || isGenerating}
                        className={`
                          w-12 sm:w-auto sm:px-6 py-4 rounded-xl font-bold text-lg shadow-md transition-all flex items-center justify-center
                          ${!resultImage || isGenerating
                            ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700' 
                            : 'bg-slate-900 text-slate-200 border border-slate-700 hover:bg-slate-800 hover:text-orange-500 hover:border-orange-500/50'
                          }
                        `}
                        title="Download Image"
                     >
                       <i className="fa-solid fa-download sm:mr-2"></i>
                       <span className="hidden sm:inline">Download</span>
                     </button>
                     
                     <button
                        onClick={handleShare}
                        disabled={!resultImage || isGenerating}
                        className={`
                          w-12 sm:w-auto sm:px-6 py-4 rounded-xl font-bold text-lg shadow-md transition-all flex items-center justify-center
                          ${!resultImage || isGenerating
                            ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700' 
                            : 'bg-slate-900 text-slate-200 border border-slate-700 hover:bg-slate-800 hover:text-blue-400 hover:border-blue-500/50'
                          }
                        `}
                        title="Share Image"
                     >
                       <i className="fa-solid fa-share-nodes sm:mr-2"></i>
                       <span className="hidden sm:inline">Share</span>
                     </button>
                 </div>
              </div>

              {/* Error Message */}
              {error === "QUOTA_EXCEEDED" ? (
                  <div className="p-4 bg-red-900/20 border border-red-900/50 text-red-400 rounded-xl flex flex-col items-start gap-2 animate-shake">
                    <div className="flex items-center gap-2 font-bold">
                        <i className="fa-solid fa-triangle-exclamation text-lg"></i>
                        <span>Generation Failed: Quota Exceeded</span>
                    </div>
                    <p className="text-sm">You have exceeded your current API quota.</p>
                    <a 
                        href="https://aistudio.google.com/app/apikey" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mt-2 bg-red-900/40 hover:bg-red-900/60 text-red-200 px-4 py-2 rounded-lg text-xs font-bold transition-colors border border-red-800"
                    >
                        Renew Quota / Get API Key
                    </a>
                  </div>
              ) : error && (
                <div className="p-4 bg-red-900/20 border border-red-900/50 text-red-400 rounded-xl flex items-center animate-shake">
                   <i className="fa-solid fa-triangle-exclamation mr-3 text-lg"></i>
                   <div>
                     <p className="font-bold text-sm">Generation Failed</p>
                     <p className="text-xs mt-1">{error}</p>
                   </div>
                </div>
              )}
            </div>

            {/* Tools Sidebar (Right) */}
            <div className="w-full lg:w-80 flex flex-col gap-4">
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 flex-1 flex flex-col shadow-lg">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-bold text-slate-200">Select Effect</h3>
                  <span className="text-xs bg-orange-900/50 text-orange-400 px-2 py-1 rounded-full font-medium border border-orange-900">
                    {EFFECTS_LIBRARY.length}
                  </span>
                </div>

                {/* 3-Column Grid for Effects */}
                <div className="grid grid-cols-3 gap-2 overflow-y-auto pr-1 custom-scrollbar max-h-[500px] lg:max-h-[calc(100vh-250px)] content-start">
                  {EFFECTS_LIBRARY.map((effect) => (
                    <EffectCard 
                      key={effect.id}
                      effect={effect}
                      isSelected={selectedEffectId === effect.id}
                      onClick={() => setSelectedEffectId(effect.id)}
                    />
                  ))}
                </div>
              </div>
              
              {/* MSME Badge (Small) */}
              <div className="bg-slate-900 rounded-xl p-3 flex items-center justify-center gap-3 text-slate-500 text-xs font-mono border border-slate-800">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="India" className="h-6 opacity-40 grayscale" />
                 <div>
                   <div className="font-bold text-slate-400">ASKFORWRITE DIGITAL</div>
                   <div>{APP_CONFIG.msmeRegistration}</div>
                 </div>
              </div>
            </div>

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);