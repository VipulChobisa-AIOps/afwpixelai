import React, { useState, useRef, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { GoogleGenAI } from "@google/genai";
import JSZip from "jszip";
const logo = "https://placehold.co/128x128?text=afw";
import { Filesystem, Directory } from '@capacitor/filesystem';

import { Share } from '@capacitor/share';
import "./index.css";

// --- Configuration & Constants ---

const APP_CONFIG = {
  appName: "afwPixelAi",
  version: "1.5.2",
  msmeRegistration: "UDYAM-RJ-14-0018404",
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
  { id: "effect_1", name: "Venetian Red", desc: "The subject wearing a Venetian red dress with delicate white lace kneeling beneath an ancient oak tree at golden hour.", icon: "fa-tree", type: "artistic", category: "Cinematic" },
  { id: "effect_2", name: "Meadow Run", desc: "The subject with hair flowing freely, smiles radiantly whilst playfully running through a multicolored meadow.", icon: "fa-sun", type: "artistic", category: "Cinematic" },
  { id: "effect_3", name: "Wildflower Bliss", desc: "The subject with flowing hair stands amidst a kaleidoscope of wildflowers, basking in golden light.", icon: "fa-leaf", type: "artistic", category: "Cinematic" },
  { id: "effect_4", name: "Rembrandt Folk", desc: "Traditional brown folk attire, holding a white flower, Rembrandt's signature lighting, Prussian blue background.", icon: "fa-palette", type: "artistic", category: "Cinematic" },
  { id: "effect_5", name: "Ballet Dedication", desc: "The subject as a ballet dancer in a vivid red leotard against a dark chalkboard backdrop.", icon: "fa-star", type: "artistic", category: "Cinematic" },
  { id: "effect_6", name: "Weightless Leap", desc: "The subject performing a stunning leap, light playing off her tutu against a muted background.", icon: "fa-person-running", type: "artistic", category: "Cinematic" },
  { id: "effect_7", name: "Flamenco Swirl", desc: "Swirl of motion, flamenco-inspired outfit in red and black, hair flowing with passion.", icon: "fa-fan", type: "artistic", category: "Cinematic" },
  { id: "effect_8", name: "Rainbow Tutu", desc: "Twirling in a rainbow-hued outfit under warm, ambient lighting.", icon: "fa-child-reaching", type: "artistic", category: "Cinematic" },
  { id: "effect_9", name: "Dandelion Dance", desc: "Twirling in a meadow with a rainbow tutu and soft glimmer of floating dandelions.", icon: "fa-wind", type: "artistic", category: "Cinematic" },
  { id: "effect_10", name: "Spring Jubilation", desc: "Arms up in jubilation amidst a field of blooming flowers and springtime splendor.", icon: "fa-seedling", type: "artistic", category: "Cinematic" },
  { id: "effect_11", name: "Water Splash", desc: "Arms raised high, playing in a water park with splashes enveloping the subject in a red outfit.", icon: "fa-water", type: "artistic", category: "Cinematic" },
  { id: "effect_12", name: "Poolside Joy", desc: "Raising arms amidst the sparkling waters of a lively pool under a golden glow.", icon: "fa-droplet", type: "artistic", category: "Cinematic" },
  { id: "effect_13", name: "Summer Droplets", desc: "Playing in water as sunlight filters through droplets, creates sparkling highlights.", icon: "fa-sun", type: "artistic", category: "Cinematic" },
  { id: "effect_14", name: "Playground Smile", desc: "Orange jacket playing on a vividly painted slide, radiating happiness.", icon: "fa-play", type: "artistic", category: "Cinematic" },
  { id: "effect_15", name: "Kite Sky", desc: "Soft sand beach, flying a vibrant kite under a vast clear sky with gentle sea breeze.", icon: "fa-umbrella-beach", type: "artistic", category: "Cinematic" },
  { id: "effect_16", name: "Kite Festival", desc: "Dashing through a vibrant kite festival with a sky mosaic of colors.", icon: "fa-cloud", type: "artistic", category: "Cinematic" },
  { id: "effect_17", name: "Fairground Adventure", desc: "Bustling amusement park, eyes sparkling with the wonder of whimsical surroundings.", icon: "fa-icons", type: "artistic", category: "Cinematic" },
  { id: "effect_18", name: "Carousel Magic", desc: "Perched atop an ornately decorated carousel horse with a whimsical backdrop.", icon: "fa-horse-head", type: "artistic", category: "Cinematic" },
  { id: "effect_19", name: "Orange Slide", desc: "Sliding down a vibrant orange slide with hands raised in excitement.", icon: "fa-play", type: "artistic", category: "Cinematic" },
  { id: "effect_20", name: "Meadow Sisters", desc: "Two people dancing in a tranquil meadow bathed in golden sunlight.", icon: "fa-user-group", type: "artistic", category: "Cinematic" },
  { id: "effect_21", name: "Dappled Path", desc: "Holding hands and running through a sun-dappled path surrounded by SQL-powered imagery.", icon: "fa-person-hiking", type: "artistic", category: "Cinematic" },
  { id: "effect_22", name: "Butterfly Night", desc: "Starlit sky, gazing at a lamppost light attracting a magnificent butterfly.", icon: "fa-bug", type: "artistic", category: "Cinematic" },
  { id: "effect_23", name: "Golden Umbrella", desc: "Tranquil evening walk under a lamppost with a vibrant umbrella and whimsical butterflies.", icon: "fa-umbrella", type: "artistic", category: "Cinematic" },
  { id: "effect_24", name: "Mystical Evening", desc: "Whimsical creature with monarch wings resting against an old-fashioned lamppost.", icon: "fa-dragon", type: "artistic", category: "Cinematic" },
  { id: "effect_25", name: "Firefly Jar", desc: "Holding a jar of fireflies amidst twilight with a fairy-tale luminescence.", icon: "fa-lightbulb", type: "artistic", category: "Cinematic" },
  { id: "effect_26", name: "Magic Box", desc: "Opening a gift with golden sparkles spilling out near a Christmas tree.", icon: "fa-gift", type: "artistic", category: "Cinematic" },
  { id: "effect_27", name: "Tiny Village", desc: "Exploring a toy village on a table in a lush garden at sunset.", icon: "fa-house-chimney", type: "artistic", category: "Cinematic" },
  { id: "effect_28", name: "Ribbon Park", desc: "Dancing with colorful ribbons forming a radiant display in the evening light.", icon: "fa-ribbon", type: "artistic", category: "Cinematic" },
  { id: "effect_29", name: "Rainbow Ribbon", desc: "Twirling a rainbow-colored ribbon in a grassy field with golden hue.", icon: "fa-ribbon", type: "artistic", category: "Cinematic" },
  { id: "effect_30", name: "Castle Focus", desc: "Deeply absorbed in constructing an elaborate sandcastle fortress.", icon: "fa-fort-awesome", type: "artistic", category: "Cinematic" },
  { id: "effect_31", name: "Beach Duo", desc: "Building a magnificent sandcastle on a pristine beach under clear blue skies.", icon: "fa-mountain-sun", type: "artistic", category: "Adventure" },
  { id: "effect_32", name: "Storybook Sand", desc: "Bucket hat, building detailed sandcastles with friends on a vibrant beach.", icon: "fa-bucket", type: "artistic", category: "Adventure" },
  { id: "effect_33", name: "Candlelight Night", desc: "Twilight pool with lily pads, glowing candles, and scattered starfish.", icon: "fa-fire-flame-curved", type: "artistic", category: "Adventure" },
  { id: "effect_34", name: "Lantern Parade", desc: "Lantern festival, leading a playful procession with a glowing lantern.", icon: "fa-paper-plane", type: "artistic", category: "Adventure" },
  { id: "effect_35", name: "Tall Grass Race", desc: "Running through tall grass at sunset with friends, feeling spontaneity.", icon: "fa-leaf", type: "artistic", category: "Adventure" },
  { id: "effect_36", name: "Summer Lantern", desc: "Running through a tall grassy field with a glowing orange lantern.", icon: "fa-bolt-lightning", type: "artistic", category: "Adventure" },
  { id: "effect_37", name: "Cultural Twirl", desc: "Colorful cultural attire with intricate patterns and vibrant feathers.", icon: "fa-feather", type: "artistic", category: "Adventure" },
  { id: "effect_38", name: "Wishful Cake", desc: "Blowing out birthday candles atop a festively adorned cake.", icon: "fa-cake-candles", type: "artistic", category: "Adventure" },
  { id: "effect_39", name: "Bday Sprinkles", desc: "Party hat, sprinkle-covered birthday cake, rainbow of balloons.", icon: "fa-birthday-cake", type: "artistic", category: "Adventure" },
  { id: "effect_40", name: "Anticipation", desc: "Closing eyes to make a wish over a sprinkle-covered cake with friends.", icon: "fa-face-grin-stars", type: "artistic", category: "Adventure" },
  { id: "effect_41", name: "Evening Field", desc: "Running through tall grass with a glowing orange lantern and silhouettes of children.", icon: "fa-mountain", type: "artistic", category: "Adventure" },
  { id: "effect_42", name: "Treehouse Pals", desc: "With a fluffy white dog on a blanket near an enchanting treehouse.", icon: "fa-house", type: "artistic", category: "Adventure" },
  { id: "effect_43", name: "Garden Tea Party", desc: "Tea party with a dog, ceramic mugs, and pink blossoms near a playhouse.", icon: "fa-mug-hot", type: "artistic", category: "Adventure" },
  { id: "effect_44", name: "Companion Tutu", desc: "Pink tutu dress, sharing a moment with a fluffy dog under a treehouse.", icon: "fa-dog", type: "artistic", category: "Cinematic" },
  { id: "effect_45", name: "Heather Fields", desc: "The subject seated in heather with a golden-furred dog under overcast skies.", icon: "fa-paw", type: "artistic", category: "Adventure" },
  { id: "effect_46", name: "Golden Retriever", desc: "The subject leaning closely behind a golden retriever in a field at golden hour.", icon: "fa-bone", type: "artistic", category: "Adventure" },
  { id: "effect_47", name: "Starlight Jar", desc: "Jar brimming with golden lights dancing like tiny stars in the dark.", icon: "fa-star-and-crescent", type: "artistic", category: "Adventure" },
  { id: "effect_48", name: "Midsummer Glow", desc: "Holding a jar with golden light reflecting in the eyes at twilight.", icon: "fa-moon", type: "artistic", category: "Adventure" },
  { id: "effect_49", name: "Style Flow", desc: "Twirling outdoors in a colorful, flowing outfit amongst meadow wildflowers.", icon: "fa-wind", type: "artistic", category: "Adventure" },
  { id: "effect_50", name: "Folk Harmonies", desc: "Traditional dance in a flowing outfit and a guitar player in the background.", icon: "fa-guitar", type: "artistic", category: "Adventure" },
  { id: "effect_51", name: "Embroidered Joy", desc: "Traditional red outfit with floral embroidery, twirling in mid-festival.", icon: "fa-shirt", type: "artistic", category: "Adventure" },
  { id: "effect_52", name: "Festival Lights", desc: "Dance celebration in the evening glow with colorful traditional attire.", icon: "fa-lightbulb", type: "artistic", category: "Adventure" },
  { id: "effect_53", name: "Vibrant Flare", desc: "Mid-twirl with a multicolored dress flaring out in soft lighting.", icon: "fa-compass-drafting", type: "artistic", category: "Adventure" },
  { id: "effect_54", name: "Studio Rainbow", desc: "Spinning in a colorful outfit that fans out like a rainbow in a sunlit studio.", icon: "fa-rainbow", type: "artistic", category: "Adventure" },
  { id: "effect_55", name: "Shadow Waltz", desc: "The subject in a white outfit, shadow playing on a checkered floor in sunlight.", icon: "fa-user", type: "artistic", category: "Adventure" },
  { id: "effect_56", name: "Peach Grace", desc: "Mid-air ballet leap in a peach outfit with focused determination.", icon: "fa-person-walking", type: "artistic", category: "Adventure" },
  { id: "effect_57", name: "Fairy Lights", desc: "The subject poised by a ballet barre under hanging fairy lights in a dreamlike glow.", icon: "fa-wand-sparkles", type: "artistic", category: "Adventure" },
  { id: "effect_58", name: "Chandelier Waltz", desc: "The subject in a pink outfit in a studio with glowing chandeliers and mirror-lined walls.", icon: "fa-gem", type: "artistic", category: "Adventure" },
  { id: "effect_59", name: "Confetti Stroll", desc: "Strolling through balloons and confetti with delight.", icon: "fa-face-grin-beam", type: "artistic", category: "Adventure" },
  { id: "effect_60", name: "Sunflower Cone", desc: "Sunflower in hair, holding an ice cream cone in the sun's soft glow.", icon: "fa-ice-cream", type: "artistic", category: "Adventure" },
  { id: "effect_61", name: "Stained Glass", desc: "The subject with a flower crown, holding an ornate book in a place of worship.", icon: "fa-church", type: "artistic", category: "Beauty" },
  { id: "effect_62", name: "Gusto Soul", desc: "Singing with passion during a communal cultural festival.", icon: "fa-microphone", type: "artistic", category: "Beauty" },
  { id: "effect_63", name: "Berry Harvest", desc: "Holding a basket of luscious strawberries on a sunny summer day.", icon: "fa-basket-shopping", type: "artistic", category: "Beauty" },
  { id: "effect_64", name: "Window Rose", desc: "Flowing dusty rose outfit by a window with ethereal golden light.", icon: "fa-window-maximize", type: "artistic", category: "Beauty" },
  { id: "effect_65", name: "Candy Floss", desc: "Holding a massive stick of candy floss amidst fairground lights.", icon: "fa-candy-cane", type: "artistic", category: "Beauty" },
  { id: "effect_66", name: "Carousel Gaze", desc: "Clinging to a bright carousel pole with a background of carnival lights.", icon: "fa-circle-dot", type: "artistic", category: "Beauty" },
  { id: "effect_67", name: "Watermelon Slice", desc: "Savoring watermelon in a garden with dappled shadows and water droplets.", icon: "fa-lemon", type: "artistic", category: "Beauty" },
  { id: "effect_68", name: "Heritage Bloom", desc: "A vivid traditional palette with a flower headdress for cultural connection.", icon: "fa-clover", type: "artistic", category: "Beauty" },
  { id: "effect_69", name: "Princess Birthday", desc: "Glittering crown and birthday number amidst garden presents.", icon: "fa-crown", type: "artistic", category: "Beauty" },
  { id: "effect_70", name: "Rope Swing", desc: "Beaming and swinging beneath a canopy of green leaves in the sun.", icon: "fa-link", type: "artistic", category: "Beauty" },
  { id: "effect_71", name: "Balloon Dance", desc: "Lifting arms in delight with a cluster of balloons.", icon: "fa-parachute-box", type: "artistic", category: "Beauty" },
  { id: "effect_72", name: "Amber Laughter", desc: "Golden hour mid-twirl with warm amber tones and subtle teal shadows.", icon: "fa-masks-theater", type: "artistic", category: "Beauty" },
  { id: "effect_73", name: "Abandon Twirl", desc: "Dynamic motion in a coral outfit against a dreamy sky blue background.", icon: "fa-wind", type: "artistic", category: "Beauty" },
  { id: "effect_74", name: "Jubilant Chase", desc: "Laughing and charging forward in a golden hour field.", icon: "fa-person-running", type: "artistic", category: "Beauty" },
  { id: "effect_75", name: "Hug the World", desc: "Arms open wide in a blooming field, soaking in the sun and wildflowers.", icon: "fa-child-reaching", type: "artistic", category: "Beauty" },
  { id: "effect_76", name: "Trusting Steed", desc: "The subject gently touching a majestic horse in a serene countryside at dusk.", icon: "fa-horse", type: "artistic", category: "Beauty" },
  { id: "effect_77", name: "Rural Harmony", desc: "The subject in serene connection with a horse shimmering in the sunset light.", icon: "fa-hat-cowboy", type: "artistic", category: "Beauty" },
  { id: "effect_78", name: "High Swing", desc: "Soaring upward on a swing at sunset.", icon: "fa-arrows-to-eye", type: "artistic", category: "Beauty" },
  { id: "effect_79", name: "Sunflower Gold", desc: "Delight among towering sunflowers during the golden hour.", icon: "fa-sun", type: "artistic", category: "Beauty" },
  { id: "effect_80", name: "Single Bubble", desc: "Standing in a mosaic of wildflowers blowing a single glimmering bubble.", icon: "fa-soap", type: "artistic", category: "Beauty" },
  { id: "effect_81", name: "Wind-Swept", desc: "Long hair swept by a soft breeze in an untamed meadow at sunset.", icon: "fa-wind", type: "artistic", category: "Beauty" },
  { id: "effect_82", name: "Flower Haze", desc: "Infectious laugh amidst a field of flowers, welcoming the beauty.", icon: "fa-leaf", type: "artistic", category: "Beauty" },
  { id: "effect_83", name: "Grass Dash", desc: "Running toward the camera through tall grass in golden warmth.", icon: "fa-forward", type: "artistic", category: "Beauty" },
  { id: "effect_84", name: "Shore Dash", desc: "Dashing along the sandy shore in a vibrant red outfit in a sea breeze.", icon: "fa-umbrella-beach", type: "artistic", category: "Beauty" },
  { id: "effect_85", name: "Tide Rider", desc: "Riding a toy car along the water's edge at dusk with golden tide.", icon: "fa-car", type: "artistic", category: "Beauty" },
  { id: "effect_86", name: "Cobblestone", desc: "Joyfully running down a historic cobblestone street with friends.", icon: "fa-road", type: "artistic", category: "Beauty" },
  { id: "effect_87", name: "Frolic Bloom", desc: "Frolicking through yellow blooms in a charming outfit.", icon: "fa-flower", type: "artistic", category: "Beauty" },
  { id: "effect_88", name: "Blue Sky Leap", desc: "Leaping high above a sea of blooming flowers under a brilliant blue sky.", icon: "fa-cloud-sun", type: "artistic", category: "Beauty" },
  { id: "effect_89", name: "Youth Essence", desc: "Basking in golden light amidst a kaleidoscope of swaying wildflowers.", icon: "fa-star", type: "artistic", category: "Beauty" },
  { id: "effect_90", name: "Wild Abandon", desc: "Leaping among wildflowers under a radiant sun and bright blue sky.", icon: "fa-sun", type: "artistic", category: "Beauty" }
];

const MODELS_TO_TRY = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-exp',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash',
  'imagen-3.0-generate-001',
  'gemini-2.0-pro-exp-02-05',
  'gemini-1.5-pro-latest',
  'gemini-pro-vision',
];

// --- AI Service ---

const generateAiImage = async (originalBase64: string, effectId: string, customDesc: string, apiKey: string): Promise<string> => {
  const backendUrl = "http://localhost:3001/generate";
  const response = await fetch(backendUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ originalBase64, effectId, customDesc, apiKey })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || "Failed to generate image from backend");
  }

  const data = await response.json();
  if (data.resultImage) {
    return data.resultImage;
  }
  
  throw new Error("No image data returned from backend");
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

const DownloadModal = ({ isOpen, onClose, onDownload }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-slate-955/95 backdrop-blur-xl animate-fade-in">
      <div className="bg-slate-900 border-2 border-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-scale-in text-center p-8 space-y-6">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto text-black text-2xl shadow-xl"><i className="fa-solid fa-cloud-arrow-down"></i></div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-white uppercase tracking-widest">Storage Access</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed px-4">Save your generated masterpiece to your device gallery</p>
        </div>
        <button onClick={onDownload} className="btn-block w-full py-4 rounded-2xl tracking-widest">Download Now</button>
        <button onClick={onClose} className="text-slate-500 font-bold text-[10px] uppercase tracking-widest hover:text-white transition-colors">Cancel</button>
      </div>
    </div>
  );
};

const InfoModal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-slate-955/95 backdrop-blur-xl animate-fade-in">
      <div className="bg-slate-900 border-2 border-white rounded-3xl w-full max-w-md shadow-[0_0_30px_rgba(255,255,255,0.1)] overflow-hidden animate-scale-in max-h-[80vh] flex flex-col">
        <div className="p-6 border-b border-white/20 flex justify-between items-center bg-white/5">
          <h2 className="font-black text-white uppercase tracking-widest">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all border border-white/30"><i className="fa-solid fa-xmark"></i></button>
        </div>
        <div className="p-8 overflow-y-auto text-white leading-relaxed space-y-4 text-sm scrollbar-thin scrollbar-thumb-white/20">
          {children}
        </div>
        <div className="p-4 border-t border-white/10 bg-black/20 text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Powered by {APP_CONFIG.poweredBy}</p>
        </div>
      </div>
    </div>
  );
};

const SubscriptionModal = ({ isOpen, onClose, freeGenCount }: any) => {
  const [showSubscription, setShowSubscription] = useState(false);

  if (!isOpen) return null;

  const handlePay = (amount: number) => {
    const upiUrl = `upi://pay?pa=${APP_CONFIG.upiId}&pn=${APP_CONFIG.appName}&am=${amount}&cu=INR&tn=Subscription for ${APP_CONFIG.appName}`;
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
                  <div key={i} className={`w-3 h-3 rounded-full border border-white/20 ${i <= freeGenCount ? 'bg-slate-700' : 'bg-orange-500 animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.6)]'}`}></div>
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

const App = () => {
  const [userApiKey, setUserApiKey] = useState(() => localStorage.getItem("GEMINI_API_KEY") || "");
  const [isKeyValid, setIsKeyValid] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
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
  }, []);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [selectedEffectId, setSelectedEffectId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isTestingModels, setIsTestingModels] = useState(false);
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("Cinematic");

  const [freeGenCount, setFreeGenCount] = useState(() => parseInt(localStorage.getItem("FREE_GEN_COUNT") || "0"));
  const [billingAcknowledged, setBillingAcknowledged] = useState(() => localStorage.getItem("BILLING_ACKNOWLEDGED") === "true");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setOriginalImage(ev.target?.result as string); setResultImage(null); setError(null); };
    reader.readAsDataURL(file);
  };
  
  const handleGenerate = async () => {
    if (!isFullAccess && trialTimeRemaining <= 0) {
      setActiveModal('payment');
      return;
    }
    if (!originalImage || !selectedEffectId) return;

    setIsGenerating(true);
    setError(null);

    try {
      const effectDesc = EFFECTS_LIBRARY.find(e => e.id === selectedEffectId)?.desc || "";
      const customDesc = selectedEffectId === 'custom_prompt' ? customPromptText : effectDesc;
      
      const gen = await generateAiImage(originalImage, selectedEffectId, customDesc, userApiKey);
      setResultImage(gen);
      setIsPreviewOpen(true);
      const newCount = freeGenCount + 1;
      setFreeGenCount(newCount);
      localStorage.setItem("FREE_GEN_COUNT", newCount.toString());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (format: string) => {
    if (!resultImage) return;
    setActiveModal(null);

    const base64 = resultImage.split(",")[1];
    const name = `afw_${Date.now()}.${format}`;

    if (typeof window !== 'undefined' && 'Capacitor' in window && (window as any).Capacitor.isNativePlatform()) {
      try {
        await Filesystem.writeFile({ path: `Pictures/${name}`, data: base64, directory: Directory.ExternalStorage });
        alert(`Success! Image saved to Mobile Gallery (Pictures folder) as ${format.toUpperCase()}.`);
        return;
      } catch (err: any) {
        try {
          await Filesystem.writeFile({ path: `Download/${name}`, data: base64, directory: Directory.ExternalStorage });
          alert(`Saved to Downloads folder! Check your files app. (Format: ${format.toUpperCase()})`);
          return;
        } catch (err2: any) {
          alert("Could not save to folder automatically due to permissions. Use the Share button below to save to Google Photos or another folder.");
        }
      }
    }

    try {
      const link = document.createElement("a");
      link.href = resultImage; link.download = name;
      link.click();
    } catch (err) {
      alert("Download failed.");
    }
  };

  const handleShare = async () => {
    if (!resultImage) return;
    try {
      const base64 = resultImage.split(",")[1];
      const name = `afw_share.png`;
      const saved = await Filesystem.writeFile({ path: name, data: base64, directory: Directory.Cache });
      await Share.share({ title: 'afw Art', text: 'Check out this art created with afwPixelAi!', url: saved.uri, dialogTitle: 'Share via Social Media' });
    } catch { alert("Sharing not supported on this device."); }
  };

  const handleTestModels = async () => {
    setIsTestingModels(true);
    for (const model of MODELS_TO_TRY) {
      try {
        const ai = new GoogleGenAI({ apiKey: userApiKey });
        await ai.models.generateContent({ model, contents: { parts: [{ text: "hi" }] } });
        alert(`✅ ${model} available!`);
      } catch { console.warn(`${model} unavailable`); }
    }
    setIsTestingModels(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-955 text-white font-sans overflow-x-hidden selection:bg-orange-500/30">
      <Header customLogo={customLogo} onOpenSettings={() => setActiveModal('settings')} isFullAccess={isFullAccess} trialTimeRemaining={trialTimeRemaining} />

      <main className="flex-1 p-4 max-w-lg mx-auto w-full space-y-6">

        {/* Compact Upload & Controls Block */}
        <div className="bg-slate-900 border-2 border-white rounded-3xl p-4 shadow-[0_10px_40px_rgba(0,0,0,0.4)] space-y-4">
          <div className="flex gap-2">
            <button onClick={() => fileInputRef.current?.click()} className="btn-block flex-1 h-14 rounded-2xl flex items-center justify-center gap-3 group text-[10px]">
              <i className="fa-solid fa-cloud-arrow-up text-orange-600 group-hover:scale-110 transition-transform"></i>
              <span>{originalImage ? "Change Photo" : "Upload Photo"}</span>
            </button>
          </div>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />

          {/* Prominent Export Actions Block */}
          <div className="flex gap-2 p-1 bg-black/40 rounded-2xl border border-white/10">
            <button
              onClick={() => setActiveModal('download')}
              disabled={!resultImage || isGenerating}
              className={`flex-1 h-12 rounded-xl flex items-center justify-center gap-2 font-black border-2 transition-all ${resultImage && !isGenerating ? 'bg-black border-white text-white hover:bg-white hover:text-black active:scale-95' : 'bg-transparent border-white/10 text-slate-700 cursor-not-allowed'}`}
            >
              <i className="fa-solid fa-download"></i>
              <span className="text-[9px] uppercase tracking-[0.2em]">Save</span>
            </button>
            <button
              onClick={handleShare}
              disabled={!resultImage || isGenerating}
              className={`flex-1 h-12 rounded-xl flex items-center justify-center gap-2 font-black border-2 transition-all ${resultImage && !isGenerating ? 'bg-black border-white text-white hover:bg-white hover:text-black active:scale-95' : 'bg-transparent border-white/10 text-slate-700 cursor-not-allowed'}`}
            >
              <i className="fa-solid fa-share-nodes"></i>
              <span className="text-[9px] uppercase tracking-[0.2em]">Share</span>
            </button>
          </div>

          {/* AI Restoration Separate Block */}
          <div className="p-1 bg-black/60 rounded-2xl border-2 border-white/20 shadow-inner">
            <button
              onClick={() => setSelectedEffectId('restoration')}
              className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 transition-all effect-border ${selectedEffectId === 'restoration' ? 'bg-white shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'bg-transparent hover:bg-white/10'}`}
            >
              <i className={`fa-solid fa-wand-magic-sparkles ${selectedEffectId === 'restoration' ? 'text-black animate-pulse' : 'text-white'}`}></i>
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${selectedEffectId === 'restoration' ? 'text-black' : 'vibrant-white'}`}>AI Restoration Mode</span>
            </button>
          </div>
        </div>

        {/* Workspace / Preview Area */}
        {originalImage && (
          <div className="space-y-4 animate-fade-in">
            <div className="aspect-square bg-slate-905 rounded-3xl border-2 border-white overflow-hidden relative shadow-[0_20px_60px_rgba(0,0,0,0.6)] group">
              <img src={isPreviewOpen && resultImage ? resultImage : originalImage} className="w-full h-full object-cover" />
              {isGenerating && (
                <div className="absolute inset-0 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center z-20">
                  <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-6 shadow-[0_0_20px_rgba(255,255,255,0.4)]"></div>
                  <span className="text-[10px] font-black animate-pulse uppercase tracking-[0.4em] text-white">Synthesizing Art</span>
                </div>
              )}
              {resultImage && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 w-full px-6">
                  <button
                    onMouseDown={() => setIsPreviewOpen(true)} onMouseUp={() => setIsPreviewOpen(false)}
                    onTouchStart={() => setIsPreviewOpen(true)} onTouchEnd={() => setIsPreviewOpen(false)}
                    className="w-full py-4 bg-white text-black rounded-2xl text-[10px] font-black border-2 border-white select-none shadow-2xl tracking-[0.3em] active:bg-orange-500 active:text-white transition-all uppercase"
                  >
                    Hold to Compare
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleGenerate}
              disabled={!selectedEffectId || isGenerating}
              className="btn-block w-full py-6 rounded-2xl text-sm tracking-[0.3em] disabled:opacity-20 flex items-center justify-center disabled:cursor-not-allowed"
            >
              {isGenerating ? "Synthesizing..." : resultImage ? "Regenerate Masterpiece" : "Generate Masterpiece"}
            </button>

          </div>
        )}

        {/* Effects Grid */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="font-black text-slate-500 text-[10px] uppercase tracking-widest">Artistic Styles</h3>
            <div className="flex gap-2">
              {["Cinematic", "Adventure", "Beauty"].map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)} className={`text-[10px] font-bold px-2 py-1 rounded-md transition-all ${activeCategory === cat ? 'bg-slate-800 text-orange-500' : 'text-slate-600 hover:text-slate-400'}`}>{cat}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 px-1">
            {EFFECTS_LIBRARY.filter(e => e.category === activeCategory).map(eff => (
              <button key={eff.id} onClick={() => setSelectedEffectId(eff.id)} className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 transition-all effect-border ${selectedEffectId === eff.id ? 'bg-white scale-105 z-10 shadow-[0_0_20px_rgba(255,255,255,0.4)]' : 'bg-black hover:border-white'}`}>
                <i className={`fa-solid ${eff.icon} text-lg ${selectedEffectId === eff.id ? 'text-black' : 'text-white'}`}></i>
                <span className={`text-[8px] font-black uppercase tracking-tighter truncate w-full px-1 text-center ${selectedEffectId === eff.id ? 'text-black' : 'vibrant-white'}`}>{eff.name}</span>
              </button>
            ))}
          </div>

        </div>

        {error === "QUOTA_EXCEEDED" && (
          <div className="p-6 bg-black border-2 border-white rounded-3xl flex flex-col items-center gap-4 text-center animate-fade-in shadow-[0_0_40px_rgba(255,255,255,0.05)]">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg"><i className="fa-solid fa-gem text-black text-2xl"></i></div>
            <div className="space-y-1">
              <p className="text-xs font-black text-white uppercase tracking-[0.25em]">Free Tokens Exhausted</p>
              <p className="text-[9px] text-slate-400 leading-normal px-6 uppercase font-bold tracking-widest">
                You have used your 3 free credits. Subscription plans are available in the <span className="text-orange-500">Settings (Gear icon)</span> above.
              </p>
            </div>
            <button
              onClick={() => setActiveModal('settings')}
              className="btn-block w-full py-4 rounded-2xl text-[10px] tracking-widest"
            >
              Open Settings to Subscribe
            </button>
          </div>
        )}

        {error === "MODEL_NOT_FOUND" && (
          <div className="p-4 bg-red-600/20 border-2 border-white rounded-3xl animate-shake flex items-center gap-3">
            <i className="fa-solid fa-circle-exclamation text-white"></i>
            <p className="text-[9px] font-black text-white leading-relaxed uppercase tracking-widest">Model Restricted: Check regional availability in settings.</p>
          </div>
        )}
      </main>

      {/* Pages Content Modals */}
      <InfoModal isOpen={activeModal === 'about'} onClose={() => setActiveModal(null)} title="About Us">
        <div className="space-y-6">
          <div className="p-4 bg-white/5 border border-white/20 rounded-2xl">
            <p className="font-black text-orange-500 text-[10px] uppercase tracking-widest mb-1">UDYAM REGISTRATION</p>
            <p className="text-white font-black">{APP_CONFIG.msmeRegistration}</p>
          </div>

          <section className="space-y-2">
            <h3 className="font-black text-white text-[12px] uppercase">Who We Are</h3>
            <p>afwPixelAi is a cutting-edge image editing platform powered by <strong>Askforwrite Digital</strong>. We bridge the gap between complex AI generation and intuitive mobile creativity.</p>
          </section>

          <section className="space-y-2">
            <h3 className="font-black text-white text-[12px] uppercase">Core Features</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-300">
              <li><strong className="text-white">AI Image Restoration:</strong> Revitalize old, blurry, or damaged photos with high-fidelity reconstruction using Imagen 3.0 technology.</li>
              <li><strong className="text-white">Artistic Style Effects:</strong> Transform portraits into Cinematic masterpieces, Adventure-themed scenes, or high-end Beauty portraits.</li>
              <li><strong className="text-white">Identity Lock:</strong> Our proprietary layering ensures the subject's original identity and age remain unchanged while the environment transforms.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-black text-white text-[12px] uppercase">Innovation</h3>
            <p>We leverage the latest Google Gemini & Imagen models to provide professional-grade aesthetic enhancements directly to your device.</p>
          </section>
        </div>
      </InfoModal>

      <InfoModal isOpen={activeModal === 'policy'} onClose={() => setActiveModal(null)} title="Privacy & Terms">
        <div className="space-y-4 text-[13px]">
          <section className="space-y-2">
            <h3 className="font-black text-white uppercase">Privacy Policy</h3>
            <p>Your privacy is paramount. afwPixelAi operates on a professional "Edit and Port" model:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>We do not store your original or edited images on our servers permanentely.</li>
              <li>Image processing is conducted securely via Google Cloud AI APIs.</li>
              <li>No personal identifying information is collected beyond app-specific settings.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-black text-white uppercase">Terms of Use</h3>
            <p>By using afwPixelAi, you agree to:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>Use generated art for lawful purposes only.</li>
              <li>Acknowledge that AI-generated output is creative and may vary in results.</li>
              <li>Not use the tool for creating misleading or harmful content.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-black text-white uppercase">Disclaimer</h3>
            <p>This is an AI-driven image editing application. While we strive for perfection via "Identity Lock", creative interpretations by the AI models are beyond our direct control. Images are processed in real-time and results depend on input quality.</p>
          </section>
        </div>
      </InfoModal>

      <InfoModal isOpen={activeModal === 'contact'} onClose={() => setActiveModal(null)} title="Contact Us">
        <div className="space-y-8 py-4">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-black text-xl shadow-xl"><i className="fa-solid fa-envelope"></i></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Support</p>
                <a href={`mailto:${APP_CONFIG.email}`} className="text-white font-black hover:text-orange-500 transition-colors uppercase tracking-wider">{APP_CONFIG.email}</a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-black text-xl shadow-xl"><i className="fa-solid fa-globe"></i></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visit Website</p>
                <a href={`https://${APP_CONFIG.website}`} target="_blank" className="text-white font-black hover:text-orange-500 transition-colors uppercase tracking-wider">{APP_CONFIG.website}</a>
              </div>
            </div>
          </div>
          <div className="p-6 bg-white/5 border border-white/20 rounded-3xl text-center">
            <p className="text-[11px] text-slate-300 italic">Expected response time within 24-48 business hours.</p>
          </div>
        </div>
      </InfoModal>

      <SubscriptionModal isOpen={activeModal === 'subscription'} onClose={() => setActiveModal(null)} freeGenCount={freeGenCount} />
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

        <div className="flex items-center justify-center gap-8 text-2xl">
          <a href="https://www.facebook.com/ask4write/" target="_blank" rel="noopener noreferrer" className="text-white hover:scale-125 transition-all"><i className="fa-brands fa-facebook"></i></a>
          <a href="https://www.instagram.com/ask4write/" target="_blank" rel="noopener noreferrer" className="text-white hover:scale-125 transition-all"><i className="fa-brands fa-instagram"></i></a>
          <a href="https://x.com/info_ask4write" target="_blank" rel="noopener noreferrer" className="text-white hover:scale-125 transition-all"><i className="fa-brands fa-twitter"></i></a>
          <a href="https://www.linkedin.com/company/104845161/admin/dashboard/" target="_blank" rel="noopener noreferrer" className="text-white hover:scale-125 transition-all"><i className="fa-brands fa-linkedin"></i></a>
          <a href="https://in.pinterest.com/vipulchobisa/" target="_blank" rel="noopener noreferrer" className="text-white hover:scale-125 transition-all"><i className="fa-brands fa-pinterest"></i></a>
          <a href="https://www.whatsapp.com/channel/0029VaCXb770AgW3UP7Iue2A" target="_blank" rel="noopener noreferrer" className="text-white hover:scale-125 transition-all"><i className="fa-brands fa-whatsapp"></i></a>
        </div>

        <p className="text-slate-500 font-black tracking-widest uppercase text-[8px]">© 2026 Askforwrite Digital • All Rights Reserved</p>
      </footer>
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
