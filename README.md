# ✨ Arcade Photo Booth ✨

A retro, web-based Photo Booth application inspired by Japanese **Purikura** machines and classic arcade aesthetics. Designed for farewell events, parties, and creating fun memories, this lightweight app runs entirely in the browser and outputs high-quality, print-ready photo collages!

---

## 📸 Features

* **Arcade Aesthetic**: Beautifully styled UI featuring a "machine casing", CRT monitor effects, scanlines, and tactile 3D buttons.
* **Auto-Capture Sequence**: Takes a sequence of **6 dynamic photos** automatically with a clean, animated countdown timer and shutter flashes. 
* **Live Grid Preview**: Seamlessly view your 2x3 photo collage right after the session ends.
* **Custom Filters**: Applies real-time visual adjustments including:
  * **NORMAL**, **B & W**, **VINTAGE**, **VIBRANT**, **COOL**, **WARM**, **FADE**, and **POP**.
* **Themed Frames**: Decorate your collage with fun visual padding and typography options:
  * **NO FRAME**, **CLASSIC**, **POLAROID**, **ARCADE**, **BESTIES**, **CLASS 22-26**, and **MY BRO**.
* **High-Res Export**: Compiles the images, filters, frames, and typography onto a hidden HTML5 Canvas to instantly export a sharp, print-ready `.jpg`. 

---

## 🛠 Tech Stack

Designed to be incredibly fast and lightweight without the need for a backend server:

* **React 19** – Component architecture & state management
* **Vite** – Lightning-fast build tooling
* **Tailwind CSS v4** – Complete UI recreation and complex micro-animations (CRT flickers, bounce effects)
* **HTML5 Canvas API** – Image rendering, scaling, text drawing, and composite exporting
* **react-webcam** – Simplified cross-device camera access
* **Lucide React** – Minimalistic iconography

---

## 🚀 Getting Started

If you want to run the machine locally on your device for an event:

### 1. Requirements

Ensure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### 2. Installation

Clone the repository and install all required modules:

```bash
# Clone the repository (if applicable)
# Navigate to the project directory
cd Photo_Booth

# Install dependencies using npm
npm install
```

### 3. Start the Machine

To boot up the Photo Booth in development mode:

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173`. Make sure to **allow camera permissions** when prompted!

### 4. Build for Production

If you want to create a static, optimized version (which can be hosted anywhere, e.g., Vercel, Netlify, or GitHub Pages):

```bash
npm run build
```

This will create an optimized build inside the `dist/` directory.

---

## 🕹️ How To Play

1. **[ INSERT COIN ]**: Okay, no coins necessary. Just stand in front of the camera!
2. **Press Start**: Hit the massive **START SESSION** button.
3. **Strike a Pose**: The machine counts down from 3 before each shot. You have a brief pause between the 6 captured shots to switch things up!
4. **Edit & Polish**: Once the sequence is complete, use the Control Deck to choose your favorite **Filter** and **Frame**. 
5. **Print**: Click the **PRINT / DOWNLOAD** button to instantly save your customized photo collage layout to your device. 

---

Made with ❤️ and plenty of `.btn-3d` CSS. Have a great farewell!
