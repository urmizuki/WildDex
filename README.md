# WildDex

A pixel-art Malaysian tree species trading card game SPA. Scan trees, collect cards, and build your forest encyclopedia.

## Features

- **Teachable Machine Integration** - Uses Google's Teachable Machine for tree species recognition
- **10 Malaysian Tree Species** - Meranti, Keruing, Rubber, Jati, Kulai, Durian, Cengal, Tualang, Rafflesia, Banyan
- **Pixel Art Jungle Scenery** - Dense fantasy forest with 30 trees, day/night toggle, smoke particles
- **Trading Card Game** - Rarity system (Common, Uncommon, Rare, Legendary), card collection, 3D flip animation
- **Mobile-First** - Designed for 480px max-width, touch-friendly, responsive
- **Image Upload Fallback** - Scan trees from camera or upload images

## Tech Stack

- Vanilla HTML/CSS/JS (no frameworks)
- TensorFlow.js + Teachable Machine
- Pixel-art SVG graphics
- CSS custom properties for theming

## Getting Started

1. Serve the folder with any static server:
```bash
python3 -m http.server 8080
```

2. Open `http://localhost:8080` in your browser

3. Allow camera access to scan trees, or use the image upload button

## Folder Structure

```
wilddex/
├── index.html          # Main HTML shell
├── css/
│   ├── main.css        # Base styles, variables, reset
│   ├── theme.css       # Day/night mode
│   ├── components.css  # Buttons, cards, modals
│   └── pages.css       # Home, scan, collection, reveal
├── js/
│   ├── app.js          # State, navigation, init
│   ├── data.js         # SPECIES array (Malaysian trees)
│   ├── scan.js         # Camera + Teachable Machine
│   ├── collection.js   # Render collection, filters
│   ├── reveal.js       # Card flip, particles
│   └── ui.js           # Modals, theme toggle
└── model/
    └── (TM model files)
```

## Teachable Machine Model

The app uses a Teachable Machine model trained on 5 Malaysian tree species:
- meranti
- cengal
- jati
- keruing
- kulai

Model URL: https://teachablemachine.withgoogle.com/models/Wdm0M5Y5F/

## License

MIT
