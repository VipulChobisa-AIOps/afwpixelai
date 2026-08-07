# afwpixelai

> **Cross-Platform Mobile AI Image Editing & Pixel Analytics Engine**

`afwpixelai` is a cross-platform mobile application built with **React 19**, **TypeScript**, and **Capacitor** (targeting Android & iOS). It delivers on-device image processing, AI-driven filter applications, and in-app subscription monetization powered by RevenueCat & Firebase.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Core Framework** | React 19, TypeScript |
| **Mobile Runtime** | Capacitor 8 (Android & iOS native bridge) |
| **Build Tool** | Vite 6 |
| **AI Integration** | Google Gemini API (`@google/genai`) |
| **Monetization & In-App Purchases** | RevenueCat (`@revenuecat/purchases-capacitor`) |
| **Authentication & Storage** | Firebase Auth & Firestore |
| **Asset Compression** | JSZip |

---

## 🌟 Core Features

1. **AI Image Enhancer & Filter Engine**: Interactive image filtering and pixel manipulation routines.
2. **Capacitor Native Bridge**: Native mobile filesystem access, native sharing (`@capacitor/share`), and native device camera capabilities.
3. **RevenueCat In-App Purchases**: Full integration with RevenueCat SDK for handling freemium tiers (₹99/mo, ₹599/yr) and subscription paywalls.
4. **Offline & Cloud Sync**: Firebase Auth integration with offline metadata handling.

---

## 📐 Architecture & Structure

```
afwpixelai/
├── index.tsx                  # Root application & canvas image engine
├── subscriptionService.ts      # RevenueCat in-app purchase manager
├── effects_90.json            # Preset filter & matrix definitions
├── capacitor.config.ts        # Capacitor mobile project configuration
├── src/                       # Component modules & utilities
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
* Node.js 18+
* Android Studio (if building native APK via Capacitor)

### Installation & Local Run
1. Clone the repository:
   ```bash
   git clone https://github.com/VipulChobisa-AIOps/afwpixelai.git
   cd afwpixelai
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development web preview:
   ```bash
   npm run dev
   ```
4. Build and sync to Android (via Capacitor):
   ```bash
   npm run build
   npx cap sync android
   npx cap open android
   ```

