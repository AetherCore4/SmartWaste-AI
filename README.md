# ♻ SmartWaste AI

> **AI-powered waste image classifier — Plastic · Paper · Metal**  
> Browser-based inference using TensorFlow.js and Google Teachable Machine.

---

## Overview

SmartWaste AI is a browser-based image classification application that uses a trained machine-learning model to identify common waste materials. Upload an image of a waste item and the app will classify it as **Plastic**, **Paper**, or **Metal** — along with confidence scores for all three categories.

All inference runs locally in your browser using TensorFlow.js. No images are ever uploaded to an external server, making the application privacy-friendly and suitable for offline use (after the model files are served via a local HTTP server).

---

## Features

- 📤 **Image upload** — supports JPG, PNG, and WEBP
- 🤖 **AI classification** — Plastic / Paper / Metal
- 📊 **Confidence visualization** — animated progress bars for all three classes
- 🔒 **Browser-based inference** — images never leave your device
- 📱 **Responsive design** — works on desktop, tablet, and mobile
- ♿ **Accessible** — semantic HTML, ARIA labels, keyboard-navigable
- 🖱️ **Drag-and-drop** upload support

---

## Machine Learning

### Training Platform
This model was trained using [Google Teachable Machine](https://teachablemachine.withgoogle.com/) — a no-code machine-learning tool by Google.

### Classes
| Class   | Training Images |
|---------|----------------|
| Plastic | 40             |
| Paper   | 40             |
| Metal   | 40             |
| **Total** | **120**      |

### Model Export
The trained model was exported in **TensorFlow.js** format directly from Teachable Machine. The export consists of three files:

```
Model/
├── model.json       — model architecture + weight manifest
├── weights.bin      — trained weights (binary)
└── metadata.json    — class labels + library versions
```

---

## Testing

A separate unseen test dataset was used to evaluate the trained model:

Testing/
├── plastic/    ← 10 images
├── paper/      ← 10 images
└── metal/      ← 10 images

10 images per class × 3 classes = **30 total test images**.

The model was evaluated automatically using `batch_test.js`.

### Results

| Class | Correct | Total | Accuracy |
|---|---:|---:|---:|
| Plastic | 9 | 10 | **90.0%** |
| Paper | 10 | 10 | **100.0%** |
| Metal | 10 | 10 | **100.0%** |
| **Overall** | **29** | **30** | **96.7%** |

The model correctly classified **29 out of 30 unseen test images**, achieving an overall accuracy of **96.7%**.

One Plastic image was incorrectly classified as Metal.

---

## Technology Stack

| Technology | Role |
|---|---|
| HTML5 | Page structure |
| CSS3 (Vanilla) | Styling and responsive layout |
| JavaScript (ES2017+) | Application logic |
| [TensorFlow.js](https://www.tensorflow.org/js) v1.7.4 | Model inference in the browser |
| [Teachable Machine Image](https://www.npmjs.com/package/@teachablemachine/image) v0.8.4 | TM model wrapper |
| Google Teachable Machine | Model training platform |

---

## Project Structure

```
Waste_Classification/
│
├── Model/
│   ├── metadata.json     — class labels and library version info
│   ├── model.json        — model topology and weight references
│   └── weights.bin       — trained model weights
│
├── Testing/
│   ├── plastic/          — 10 unseen test images (Plastic)
│   ├── paper/            — 10 unseen test images (Paper)
│   └── metal/            — 10 unseen test images (Metal)
│
├── Training/
│   ├── plastic/          — 40 training images (Plastic)
│   ├── paper/            — 40 training images (Paper)
│   └── metal/            — 40 training images (Metal)
│
├── index.html            — Main web application
├── style.css             — Stylesheet
├── script.js             — Application logic + model integration
├── README.md             — This file
└── .gitignore            — Git exclusions
```

---

## How to Run

> ⚠️ **Important**: You must serve the project through a local HTTP server. Opening `index.html` directly via `file://` will cause browser security errors (CORS policy) when TensorFlow.js tries to fetch the model files.

### Option 1 — VS Code Live Server (recommended for beginners)

1. Open the `Waste_Classification` folder in VS Code.
2. Install the **Live Server** extension (by Ritwick Dey).
3. Right-click `index.html` → **Open with Live Server**.
4. The browser will open automatically at `http://127.0.0.1:5500`.

### Option 2 — Python HTTP Server

```bash
# Python 3
cd path/to/Waste_Classification
python -m http.server 8000
```

Then open: [http://localhost:8000](http://localhost:8000)

### Option 3 — Node.js serve

```bash
npx serve .
```

---

## How the Model Works

```
User uploads image
        │
        ▼
File validation (type + size)
        │
        ▼
Image displayed in preview
        │
        ▼
User clicks "Classify Waste"
        │
        ▼
tmImage.predict(imageElement)
        │
        ▼
TensorFlow.js runs inference
[Preprocessing → MobileNet features → Classification head]
        │
        ▼
Probabilities for each class
[{ className: "Plastic", probability: 0.94 }, ...]
        │
        ▼
Highest probability = predicted class
        │
        ▼
Results displayed with confidence bars
```

The Teachable Machine model uses **MobileNet** as a feature extractor, followed by a custom classification head trained on your images. The model accepts 224×224 pixel input images.

---

## Limitations

- **Small training dataset** — only 120 images total (40 per class)
- **Limited categories** — only 3 waste types (Plastic, Paper, Metal)
- **Image quality dependency** — lighting, background, and angle affect predictions
- **Similar-looking materials** — may confuse the model (e.g. metallic-looking plastic)
- **Controlled training images** — model may not generalise well to all real-world conditions
- **Prototype only** — not intended for industrial or commercial waste-sorting use

---

## Future Improvements

- More waste categories (glass, organic, e-waste, textiles, etc.)
- Larger and more diverse training datasets with real-world images
- Data augmentation during training for better generalisation
- Camera-based live classification (without file upload)
- Expand the test dataset for more reliable evaluation
- Generate a confusion matrix for detailed error analysis
- Integration with smart recycling bin systems
- Progressive Web App (PWA) for offline use

---

## Author

> **Jishan Shaikh**  
> Machine Learning Model Exploration Project  
> GitHub: https://github.com/AetherCore4  
> LinkedIn: https://www.linkedin.com/in/jishan-shaikh-022706330

---

## Acknowledgements

- [Google Teachable Machine](https://teachablemachine.withgoogle.com/) — for making model training accessible
- [TensorFlow.js](https://www.tensorflow.org/js) — for in-browser machine learning
- Waste image datasets used for training and testing

---

*This project was created for educational purposes as part of a beginner machine-learning exploration. It is a demonstration prototype and not a production waste-sorting system.*
