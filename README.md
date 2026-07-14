# PlastiVision AI ♻️

An end-to-end intelligent waste classification and routing system driven by deep learning.

---

## 📄 Abstract

**PlastiVision AI** is an intelligent waste classification and management system developed to address the critical global challenge of waste mismanagement and sorting inefficiency. Driven by a fine-tuned **Vision Transformer (ViT)** model, the system categorizes waste items into **Organic (Biodegradable)** and **Recyclable (Non-Biodegradable)** classes with high accuracy and low latency. 

By integrating state-of-the-art computer vision with a modern web ecosystem—comprising a lightweight **Flask API** backend and a responsive, glassmorphic **React + Vite** frontend—PlastiVision AI provides real-time waste analysis. In addition to core classification, the application estimates carbon footprint savings, offers localized environmental tips, visualizes model evaluation metrics (including accuracy, confusion matrices, and ROC curves), and features an interactive AI chatbot helper to guide users in waste disposal best practices. PlastiVision AI aims to bridge the gap between complex deep learning models and practical, daily environmental action.

---

## 🚀 Key Features

- **Real-Time Image Scan & Prediction:** Instantly upload/drag-and-drop waste items for AI-driven classification.
- **Vision Transformer (ViT) Backend:** High-accuracy fine-tuned transformer architecture for robust feature extraction.
- **Carbon Footprint Impact Metrics:** Displays calculated environmental offsets based on the sorted waste.
- **Interactive AI Chat Assistant:** Ask questions about recycling guidelines and receive instant guidance.
- **Interactive Model Performance Dashboard:** Visualizes validation curves, confusion matrices, and ROC curves.
- **Dynamic Dataset Explorer:** Browse and understand the classes, data distribution, and dataset details.

---

## 🛠️ Tech Stack

### Frontend
- **React 18** & **Vite** (HMR & fast builds)
- **TailwindCSS** (Modern, responsive UI styling)
- **Lucide Icons** & **Framer Motion** (Smooth transitions & animations)

### Backend
- **Flask** (Lightweight Python web framework)
- **PyTorch** & **Torchvision** (Deep learning model inference)
- **Pillow (PIL)** & **NumPy** (Image preprocessing)

### Deep Learning Model
- **Vision Transformer (ViT-B/16)** fine-tuned on the **Waste Classification Dataset** (~22,500 images of Organic and Recyclable items).

---

## 📁 Repository Structure

```
plastiVision/
├── backend/                  # Flask REST API & Deep Learning pipeline
│   ├── api/                  # API endpoints (prediction & chat)
│   ├── models/               # ViT model architecture definitions
│   ├── saved_model/          # Directory containing serialized model weights
│   ├── utils/                # Preprocessing, data augmentation, tips
│   ├── app.py                # Main backend entry point
│   ├── config.py             # Global configurations & mapping
│   ├── train.py              # Model training script
│   └── evaluate.py           # Model evaluation and metric plotting
├── dataset/                  # Dataset documentation & local data storage
│   └── README.md             # Dataset download & setup instructions
├── src/                      # React frontend codebase
│   ├── assets/               # Static assets & images
│   ├── components/           # Reusable UI components
│   ├── pages/                # Page views (Scan, About, Dashboard, Dataset, etc.)
│   ├── App.jsx               # App routing & layouts
│   └── main.jsx              # React mounting file
├── package.json              # Frontend dependencies
├── requirements.txt          # Python/PyTorch dependencies
└── README.md                 # This file
```

---

## 🚦 Getting Started

For detailed dataset download instructions and initial configuration, see the [dataset/README.md](file:///d:/amrita/sem7/nn/plastiVision/dataset/README.md).

### 1. Set Up the Backend
Ensure you have Python 3.9+ installed.

```bash
# Clone the repository (if not already done)
git clone https://github.com/snigdhasirivalli/plastiVision.git
cd plastiVision

# Install backend dependencies
pip install -r requirements.txt

# Download/place the dataset under dataset/raw/ and run training (optional if model exists)
cd backend
python train.py

# Run evaluation to produce metrics
python evaluate.py

# Start the Flask development server
python app.py
```
The Flask API will run at `http://localhost:5000`.

### 2. Set Up the Frontend
In a new terminal window:

```bash
# Navigate to the root directory
cd plastiVision

# Install frontend dependencies
npm install

# Run the development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to interact with PlastiVision AI.

---

## 📈 Model Performance Summary
The model utilizes a pre-trained Vision Transformer fine-tuned to segment recyclable and organic matter, achieving high precision suited for industrial sorting assistance. Run `python backend/evaluate.py` to generate current confusion matrix and ROC curves based on your validation set.
