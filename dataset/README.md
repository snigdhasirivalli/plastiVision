# PlastiVision AI — Dataset Directory

## Download the Waste Classification Dataset

**Dataset**: [Waste Classification Data by techsash — Kaggle](https://www.kaggle.com/datasets/techsash/waste-classification-data)

### Option 1: Manual Download (Recommended for first-time setup)

1. Go to https://www.kaggle.com/datasets/techsash/waste-classification-data
2. Click **Download** (you need a free Kaggle account)
3. Extract the ZIP file
4. Inside you will find a `DATASET/TRAIN/` folder with two subfolders:
   - `O/` — Organic waste images (~12,565 images)
   - `R/` — Recyclable waste images (~9,999 images)
5. Copy the contents of `TRAIN/` into `dataset/raw/`:

```
dataset/
└── raw/
    ├── O/          ← Organic (Biodegradable)
    │   ├── img001.jpg
    │   └── ...
    └── R/          ← Recyclable (Non-Biodegradable)
        ├── img001.jpg
        └── ...
```

### Option 2: Kaggle CLI Download

```bash
# Install Kaggle CLI
pip install kaggle

# Place your kaggle.json API key in ~/.kaggle/kaggle.json
# Get it from: https://www.kaggle.com/settings → API → Create New Token

# Download and extract
kaggle datasets download -d techsash/waste-classification-data -p dataset/
cd dataset
unzip waste-classification-data.zip
# Then move DATASET/TRAIN/ contents to dataset/raw/
```

---

## After Placing the Dataset

```bash
# Step 1: Install Python dependencies
pip install -r requirements.txt

# Step 2: Train the model (ViT fine-tuning)
cd backend
python train.py

# Step 3: Evaluate (generates accuracy, confusion matrix, ROC curve, etc.)
python evaluate.py

# Step 4: Start the Flask API server
python app.py
```

Then in another terminal:
```bash
# Step 5: Start the React frontend
npm run dev
```

Open http://localhost:5173 → Scan page → Upload an image → Click **Predict**

---

## Class Mapping

| Folder | Detected Object     | Waste Category    | Recommended Bin |
|--------|---------------------|-------------------|-----------------|
| `O/`   | Organic Waste       | Biodegradable     | Compost Bin     |
| `R/`   | Recyclable Waste    | Non-Biodegradable | Recycle Bin     |

---

## Replacing with Your Custom Dataset (Later)

1. Replace `dataset/raw/` with your new dataset (one subfolder per class)
2. Open `backend/config.py` and update:
   - `DATASET_DIR` (if path differs)
   - `CLASS_NAMES` — list your class folder names
   - `WASTE_MAPPING` — map each class to category + bin
3. Re-run: `python backend/train.py`
4. Restart: `python backend/app.py`

**No other files need to change.** The frontend automatically receives the new class names in API responses.
