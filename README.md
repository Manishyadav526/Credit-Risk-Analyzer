# 💳 Credit Risk Analyzer

An end-to-end Machine Learning application for predicting the probability of loan default and classifying loan applications into **Low Risk** or **High Risk**.

The project covers the complete Machine Learning lifecycle — from **EDA, data cleaning, preprocessing, model training, model comparison, hyperparameter tuning, probability calibration, threshold optimization, model serialization, FastAPI deployment, frontend integration, and Render deployment**.

---

## 📌 Project Overview

Credit risk assessment is an important problem in the lending industry. The goal of this project is to predict whether a loan applicant is likely to default based on financial, employment, loan, and credit-history information.

Instead of providing only a binary prediction, the system also generates a **default probability**. This probability is evaluated against configurable decision thresholds.

### Final System

- **Model:** Isotonic-Calibrated XGBoost
- **Test Accuracy:** 94.03%
- **Soft Threshold:** 0.39
- **Hard Threshold:** 0.19
- **Backend:** FastAPI
- **Frontend:** HTML, CSS, JavaScript
- **Deployment:** Render

---

# 🎯 Problem Statement

The objective is to predict whether a loan applicant is likely to default.

The target variable is:

```text
loan_status
```

```text
0 → Non-Default
1 → Default
```

For this project, **Class 1 represents loan default**.

A major focus during evaluation was the **False Negative (FN)**:

```text
Actual Default → Predicted Non-Default
```

The project therefore evaluates:

- Accuracy
- Precision
- Recall
- F1 Score
- Average Precision
- Confusion Matrix
- Brier Score
- Log Loss
- False Negatives

---

# 📊 Dataset

The dataset contains applicant financial information, employment details, loan characteristics, and credit history.

| Feature | Description |
|---|---|
| `person_age` | Age of the applicant |
| `person_income` | Annual income |
| `person_home_ownership` | Home ownership status |
| `person_emp_length` | Employment length |
| `loan_intent` | Purpose of the loan |
| `loan_grade` | Loan grade |
| `loan_amnt` | Loan amount |
| `loan_int_rate` | Loan interest rate |
| `loan_percent_income` | Loan amount as a percentage of income |
| `cb_person_default_on_file` | Previous default history |
| `cb_person_cred_hist_length` | Length of credit history |
| `loan_status` | Target variable |

---

# 🔍 Exploratory Data Analysis

Before training, EDA was performed to understand the dataset and identify data-quality issues.

### EDA Steps

1. Checked dataset shape before transformations.
2. Examined data types.
3. Identified numerical, categorical, and binary features.
4. Checked missing values.
5. Checked duplicate rows.
6. Inspected outliers using statistical analysis and box plots.
7. Analyzed class distribution.
8. Examined numerical correlations using a heatmap.

### Data Cleaning

Data-quality checks were performed for:

- `person_age`
- `person_emp_length`
- `loan_amnt`
- `loan_int_rate`
- `loan_percent_income`

For example:

```python
df_copy = df_copy[df_copy["loan_amnt"] > 0]
```

Employment length was also checked against applicant age and unrealistic values.

---

# 🧹 Data Preprocessing

The dataset contains numerical and categorical features.

## Numerical Features

Numerical features were handled using imputation.

For Logistic Regression, numerical features were also scaled.

```text
Numerical Features
        ↓
Imputation
        ↓
Scaling
```

## Categorical Features

Categorical features were processed using:

```text
Categorical Features
        ↓
Imputation
        ↓
One-Hot Encoding
```

---

# ✂️ Train-Test Split

The dataset was split using:

```python
train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)
```

### Why `stratify=y`?

It maintains approximately the same target-class distribution in training and testing data.

### Test Set

```text
Total Samples: 6482
Class 0: 5064
Class 1: 1418
```

The test set was kept separate for final evaluation.

---

# 🤖 Machine Learning Models

Six model configurations were evaluated:

1. Baseline Logistic Regression
2. Baseline XGBoost
3. Tuned XGBoost
4. Tuned Logistic Regression
5. Isotonic-Calibrated XGBoost
6. Sigmoid-Calibrated XGBoost

---

# 1️⃣ Baseline Logistic Regression

| Metric | Score |
|---|---:|
| Accuracy | 81% |
| Precision | 0.54 |
| Recall | 0.78 |
| F1 Score | 0.64 |

### Confusion Matrix

```text
[[4119, 945],
 [ 310, 1108]]
```

---

# 2️⃣ Baseline XGBoost

| Metric | Score |
|---|---:|
| Accuracy | 92% |
| Precision | 0.81 |
| Recall | 0.81 |
| F1 Score | 0.81 |

---

# 3️⃣ Hyperparameter-Tuned XGBoost

Tuning was performed using:

```text
RandomizedSearchCV
```

Configuration:

```text
150 candidate parameter combinations
5-fold cross-validation
750 total fits
Scoring = Average Precision
```

### Best Cross-Validation Score

```text
0.904157629858496
```

### Best Parameters

```text
n_estimators       = 428
max_depth          = 8
learning_rate      ≈ 0.0456
min_child_weight   = 4
gamma              ≈ 1.9279
subsample          ≈ 0.8717
colsample_bytree   ≈ 0.9817
```

### Test Performance at Threshold 0.5

| Metric | Score |
|---|---:|
| Accuracy | 93% |
| Precision | 0.84 |
| Recall | 0.81 |
| F1 Score | 0.82 |

### Confusion Matrix

```text
[[4853, 211],
 [ 275, 1143]]
```

---

# 4️⃣ Hyperparameter-Tuned Logistic Regression

### Best Parameters

```text
C ≈ 9.747555
solver = liblinear
```

### Best Cross-Validation Average Precision

```text
≈ 0.7196
```

### Test Performance

| Metric | Score |
|---|---:|
| Accuracy | 81% |
| Precision | 0.54 |
| Recall | 0.78 |
| F1 Score | 0.64 |

---

# 📊 Initial Model Comparison

| Model | Accuracy | Precision | Recall | F1 Score |
|---|---:|---:|---:|---:|
| Baseline Logistic Regression | 81% | 0.54 | 0.78 | 0.64 |
| Baseline XGBoost | 92% | 0.81 | 0.81 | 0.81 |
| Tuned XGBoost | 93% | 0.84 | 0.81 | 0.82 |
| Tuned Logistic Regression | 81% | 0.54 | 0.78 | 0.64 |

The tuned XGBoost model was taken forward for probability calibration.

---

# 🎯 Probability Calibration

A classification model can produce probabilities using:

```python
predict_proba()
```

However, predicted probabilities are not automatically well calibrated.

Because this project uses probability-based risk decisions, calibration was performed on the tuned XGBoost model.

Two calibration techniques were evaluated:

1. Isotonic Calibration
2. Sigmoid Calibration

---

# 🔵 Isotonic Calibration

```python
CalibratedClassifierCV(
    best_model,
    method="isotonic",
    cv=5
)
```

### Metrics

```text
Brier Score = 0.04963
Log Loss    = 0.17744
```

---

# 🟣 Sigmoid Calibration

```python
CalibratedClassifierCV(
    best_model,
    method="sigmoid",
    cv=5
)
```

### Metrics

```text
Brier Score = 0.05130
Log Loss    = 0.18257
```

Lower Brier Score and Log Loss indicate better calibration.

---

# 📈 Calibration Comparison

| Model | Brier Score | Log Loss |
|---|---:|---:|
| Isotonic XGBoost | 0.04963 | 0.17744 |
| Sigmoid XGBoost | 0.05130 | 0.18257 |

The calibration curve was also analyzed.

Based on the calibration metrics and calibration curve, **Isotonic XGBoost was selected as the deployed model**.

---

# 🎚️ Threshold Optimization

The default classification threshold is generally:

```text
0.50
```

However, the application can use different thresholds depending on the desired operating point.

```text
Probability >= Threshold
          ↓
       Default
```

```text
Probability < Threshold
          ↓
     Non-Default
```

The analysis considered:

- Accuracy
- Precision
- Recall
- F1 Score
- False Negatives
- False Positives

---

# 🟢 Soft Threshold

Selected Soft Threshold:

```text
0.39
```

This represents an accuracy-focused operating point.

### Performance

```text
Accuracy  = 94.03%
Precision = 95.82%
Recall    = 76.02%
F1 Score  = 84.78%
```

### Confusion Matrix Components

```text
TN = 5017
FP = 47
FN = 340
TP = 1078
```

---

# 🔴 Hard Threshold

Selected Hard Threshold:

```text
0.19
```

This threshold puts greater emphasis on reducing false negatives.

### Performance

```text
Accuracy  = 89.59%
Precision = 71.92%
Recall    = 85.97%
F1 Score  = 78.32%
```

### Confusion Matrix Components

```text
TN = 4588
FP = 476
FN = 199
TP = 1219
```

Compared with Soft mode, Hard mode reduces false negatives while accepting lower overall accuracy.

---

# ⚖️ Soft vs Hard Threshold

| Mode | Threshold | Accuracy | Recall | False Negatives |
|---|---:|---:|---:|---:|
| Soft | 0.39 | 94.03% | 76.02% | 340 |
| Hard | 0.19 | 89.59% | 85.97% | 199 |

### Soft Mode

```text
Threshold = 0.39
Higher Accuracy
More False Negatives
```

### Hard Mode

```text
Threshold = 0.19
Higher Recall
Fewer False Negatives
Lower Overall Accuracy
```

The threshold changes the decision boundary without retraining the model.

---

# 🏆 Final Model Selection

After model comparison, XGBoost hyperparameter tuning, probability calibration, and threshold analysis, the deployed model is:

## Isotonic-Calibrated XGBoost

| Metric | Value |
|---|---:|
| Test Accuracy | **94.03%** |
| Brier Score | **0.04963** |
| Log Loss | **0.17744** |
| Soft Threshold | **0.39** |
| Hard Threshold | **0.19** |

---

# 💾 Model Serialization

The final calibrated model was saved as:

```text
credit_risk_model.pkl
```

Threshold configuration:

```text
thresholds.pkl
```

Contents:

```python
{
    "soft_threshold": 0.39,
    "hard_threshold": 0.19
}
```

This allows FastAPI to load the trained model and thresholds without retraining.

---

# 🔄 End-to-End Project Flow

```text
                    ┌──────────────────────┐
                    │     Loan Dataset     │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ EDA & Data Cleaning  │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │    Preprocessing     │
                    │ Imputation / Encoding│
                    │ Scaling where needed │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  Train/Test Split    │
                    │   Stratified Split   │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Model Training     │
                    │ Logistic Regression  │
                    │ XGBoost              │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Model Comparison     │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ XGBoost Tuning       │
                    │ RandomizedSearchCV   │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Probability          │
                    │ Calibration          │
                    │ Isotonic / Sigmoid   │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Threshold Analysis   │
                    │ Soft = 0.39          │
                    │ Hard = 0.19          │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Final Model          │
                    │ Isotonic XGBoost     │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Joblib Serialization │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │      FastAPI         │
                    │      /predict        │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ HTML/CSS/JavaScript  │
                    │      Frontend        │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ LOW RISK / HIGH RISK │
                    │ + Probability        │
                    │ + Threshold          │
                    └──────────────────────┘
```

---

# 🌐 FastAPI Backend

The trained ML model is served through **FastAPI**.

### Endpoint

```text
POST /predict
```

The API receives loan application information and the selected threshold mode.

---

# 📥 API Request Example

```json
{
  "person_age": 25,
  "person_income": 35000,
  "person_home_ownership": "RENT",
  "person_emp_length": 2,
  "loan_intent": "PERSONAL",
  "loan_grade": "C",
  "loan_amnt": 10000,
  "loan_int_rate": 14.5,
  "loan_percent_income": 0.29,
  "cb_person_default_on_file": "N",
  "cb_person_cred_hist_length": 3,
  "threshold_mode": "soft"
}
```

---

# 📤 API Response Example

```json
{
  "default_probability": 0.0807,
  "default_prediction": 0,
  "threshold_mode": "soft",
  "threshold_used": 0.39,
  "Result": "Low Risk"
}
```

The API returns:

- Default probability
- Default prediction
- Threshold mode
- Threshold used
- Risk classification

The frontend converts:

```text
0.0807
```

into:

```text
8.1%
```

for user-friendly display.

---

# 🖥️ Frontend

The project includes an interactive frontend built using:

- HTML
- CSS
- JavaScript

## Homepage

The homepage contains:

- Project introduction
- Model comparison
- Model accuracy
- Active model information
- How the system works
- Project information
- GitHub link

All evaluated models are displayed, while only **Isotonic XGBoost** is marked as the active deployed model.

## Prediction Page

The prediction page allows users to enter:

- Age
- Income
- Home ownership
- Employment length
- Loan intent
- Loan grade
- Loan amount
- Interest rate
- Loan-to-income ratio
- Previous default history
- Credit history length

Users can select:

- **Soft Threshold**
- **Hard Threshold**

The result page displays:

- Default probability
- Threshold
- Risk classification
- Selected threshold mode
- Risk explanation

---

# 📁 Project Structure

```text
Credit-Risk-Analyzer/
│
├── main.py
├── credit_risk_model.pkl
├── thresholds.pkl
├── credit_risk_dataset.csv
├── Credit_Risk.ipynb
├── requirements.txt
├── render.yaml
├── runtime.txt
│
└── static/
    ├── index.html
    ├── home.css
    ├── home.js
    ├── predict.html
    ├── predict.css
    └── predict.js
```

---

# 📄 Important Files

### `Credit_Risk.ipynb`

Contains the complete Machine Learning workflow:

```text
Data Loading
     ↓
EDA
     ↓
Data Cleaning
     ↓
Preprocessing
     ↓
Train-Test Split
     ↓
Baseline Models
     ↓
Hyperparameter Tuning
     ↓
Model Evaluation
     ↓
Probability Calibration
     ↓
Threshold Analysis
     ↓
Final Model Selection
     ↓
Model Export
```

### `credit_risk_model.pkl`

Contains the final Isotonic-Calibrated XGBoost model.

### `thresholds.pkl`

Contains the Soft and Hard decision thresholds.

### `main.py`

FastAPI backend responsible for:

- Loading the trained model
- Loading threshold configuration
- Validating incoming data
- Generating default probabilities
- Applying the selected threshold
- Returning the final prediction

### `static/`

Contains the complete frontend.

### `requirements.txt`

Contains the Python dependencies required to run the application.

### `render.yaml`

Contains the Render deployment configuration.

### `runtime.txt`

Specifies the Python runtime version used for deployment.

---

# ⚙️ How to Run Locally

## 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd Credit-Risk-Analyzer
```

## 2. Create a Virtual Environment

For Windows:

```powershell
python -m venv venv
```

Activate:

```powershell
venv\Scriptsctivate
```

## 3. Install Dependencies

```bash
pip install -r requirements.txt
```

## 4. Run FastAPI

```bash
uvicorn main:app --reload
```

Open:

```text
http://127.0.0.1:8000
```

---

# 📚 API Documentation

FastAPI automatically provides Swagger documentation:

```text
http://127.0.0.1:8000/docs
```

Use Swagger UI to test the `/predict` endpoint.

---

# 🚀 Deployment

The project is configured for deployment on **Render**.

Included deployment files:

```text
render.yaml
runtime.txt
requirements.txt
```

### Build Command

```bash
pip install -r requirements.txt
```

### Start Command

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

---

# 🔐 Risk Decision Logic

The final classification is based on the predicted default probability.

### Soft Mode

```text
Threshold = 0.39
```

### Hard Mode

```text
Threshold = 0.19
```

Prediction logic:

```python
prediction = int(probability >= threshold)
```

Therefore:

```text
probability < threshold
        ↓
LOW RISK
```

and:

```text
probability >= threshold
        ↓
HIGH RISK
```

The threshold does not retrain the model. It only changes how the predicted probability is converted into the final classification.

---

# 📈 Key Machine Learning Concepts Implemented

- Exploratory Data Analysis
- Data Cleaning
- Missing Value Handling
- Data Type Optimization
- Outlier Analysis
- Categorical Encoding
- Feature Scaling
- Train-Test Split
- Stratified Sampling
- Cross-Validation
- Stratified K-Fold Cross-Validation
- Logistic Regression
- XGBoost
- Hyperparameter Tuning
- RandomizedSearchCV
- Average Precision
- Confusion Matrix
- Precision
- Recall
- F1 Score
- Probability Calibration
- Isotonic Calibration
- Sigmoid Calibration
- Brier Score
- Log Loss
- Threshold Optimization
- False Negative Analysis
- Model Serialization
- FastAPI
- REST API
- Frontend Integration
- Render Deployment

---

# 🛠️ Technology Stack

| Category | Technologies |
|---|---|
| Programming Language | Python |
| Data Processing | Pandas, NumPy |
| Machine Learning | Scikit-learn, XGBoost |
| Model Calibration | CalibratedClassifierCV |
| Model Persistence | Joblib |
| Backend | FastAPI |
| API Validation | Pydantic |
| Frontend | HTML, CSS, JavaScript |
| Deployment | Render |
| Version Control | Git, GitHub |

---

# 📌 Final Project Result

The complete project follows:

```text
Raw Dataset
      ↓
EDA & Data Cleaning
      ↓
Preprocessing
      ↓
Train/Test Split
      ↓
Model Training
      ↓
Model Comparison
      ↓
XGBoost Hyperparameter Tuning
      ↓
Probability Calibration
      ↓
Isotonic vs Sigmoid Comparison
      ↓
Threshold Analysis
      ↓
Isotonic XGBoost
      ↓
Joblib Model Export
      ↓
FastAPI
      ↓
Frontend
      ↓
Risk Prediction
      ↓
Render Deployment
```

### Final Deployed Model

```text
Model:
Isotonic-Calibrated XGBoost

Test Accuracy:
94.03%

Soft Threshold:
0.39

Hard Threshold:
0.19

Brier Score:
0.04963

Log Loss:
0.17744
```

---

# ⚠️ Disclaimer

This project is developed for educational and demonstration purposes.

The predictions generated by this system should not be used as the sole basis for real-world lending, credit approval, or financial decisions.

---

# 👨‍💻 Author

**Manish Yadav**

GitHub:  
https://github.com/Manishyadav526

---

⭐ If you find this project useful or interesting, consider giving the repository a star.
