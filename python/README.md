# Building Cooling Load Prediction using Machine Learning

A machine learning web application to predict building **Cooling Load** (and Heating Load) based on building geometry and fenestration parameters, based on the **UCI Energy Efficiency Dataset** (Tsanas & Xifara, 2012).

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- Python 3.9+ (Python 3.10 or 3.11 recommended)
- `pip` package manager

### 2. Setup Virtual Environment
```bash
# Clone or navigate to the directory
cd python

# Create a virtual environment
python -m venv .venv

# Activate virtual environment
# On Linux / macOS:
source .venv/bin/activate
# On Windows:
.venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. (Optional) Train & Benchmark Models
Run the training script to benchmark Random Forest, Gradient Boosting, Ridge Regression, and XGBoost:
```bash
python train_model.py
```
This prints the $R^2$ scores, RMSE, cross-validation metrics, and saves `models/cooling_load_model.joblib`.

### 5. Launch the Streamlit Web Application
```bash
streamlit run app.py
```
Streamlit will launch locally in your browser at `http://localhost:8501`.

---

## 📊 Dataset Features (UCI Energy Efficiency)
- **X1 Relative Compactness**: Volume-to-surface ratio normalized to a cube (0.62 - 0.98)
- **X2 Surface Area**: Total exterior envelope area (514.5 - 808.5 m²)
- **X3 Wall Area**: Exterior vertical wall boundary (245.0 - 416.5 m²)
- **X4 Roof Area**: Top roof boundary (110.25 - 220.5 m²)
- **X5 Overall Height**: Building height (3.5m = 1 story, 7.0m = 2 stories)
- **X6 Orientation**: Cardinal exposure (2: North, 3: East, 4: South, 5: West)
- **X7 Glazing Area**: Window-to-envelope ratio (0%, 10%, 25%, 40%)
- **X8 Glazing Distribution**: Fenestration distribution across facades (0 to 5)

**Target Outputs:**
- **Y1 Heating Load** ($kWh/m^2$)
- **Y2 Cooling Load** ($kWh/m^2$)
