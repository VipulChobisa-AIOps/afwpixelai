# afwpixelai
**Mobile AI Image Processing & Pixel Analytics Engine**

`afwpixelai` is a mobile application developed in **Android Studio** using **Java** and **Kotlin**. It is designed to perform on-device edge image analytics, rendering, and classification. By doing the computer vision processing on the client's device, the app avoids network latency and ensures data privacy.

---

## 🛠️ Technology Stack
*   **IDE**: Android Studio
*   **Languages**: Kotlin, Java (for legacy native rendering modules)
*   **UI Framework**: Jetpack Compose (modern declarative layout)
*   **Threading**: Kotlin Coroutines & Flow (for async pixel manipulation)
*   **Local Caching**: Room DB (storing metadata and user preferences)
*   **Core Libraries**: CameraX (camera API integration), OpenCV Android SDK (for pixel filters and matrix convolutions)

---

## 🌟 Core Features

1.  **Real-Time Camera Convolutions**: Captures pixel matrices through CameraX and applies real-time edge, blur, and sharpening convolutions directly on the GPU.
2.  **Color Histogram Extraction**: Computes RGB channel histograms dynamically, displaying color profiles of the frame in real time.
3.  **Local Image Classification**: Uses a lightweight native neural model to catalog and tag images into user galleries offline.
4.  **Batch Processing**: Allows selecting multiple photos from the gallery to run automated metadata extraction and tag editing.

---

## 📐 Architecture

The project follows the standard **MVVM (Model-View-ViewModel)** architectural pattern recommended by Google, coupled with Clean Architecture concepts:

```
/src/main/java/com/unolo/afwpixelai
├── data/
│   ├── local/          # Room Database & Shared Preferences
│   └── repository/     # Data sources coordinators
├── domain/
│   ├── model/          # Pure entity models
│   └── usecase/        # Business logic rules (e.g. ApplyFilterUseCase)
├── presentation/
│   ├── viewmodel/      # UI State holders
│   └── ui/             # Composed views, screens, and custom canvases
└── utils/              # Pixel manipulation helpers (JNI calls)
```

---

## 🚀 Getting Started

### Prerequisites
*   Android Studio Ladybug (2024.2.1+) or newer.
*   Android SDK Platform 34 (Android 14) or newer.
*   JDK 17.

### Installation
1.  Clone the repository:
    ```bash
    git clone https://github.com/VipulChobisa_AIOps/afwpixelai.git
    ```
2.  Open the project in Android Studio.
3.  Sync project with Gradle files.
4.  Build and run on an Android Device or Emulator.
