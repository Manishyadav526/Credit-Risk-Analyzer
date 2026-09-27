from fastapi import FastAPI
from pydantic import BaseModel
from typing import Literal
import pandas as pd
import joblib
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles


# ============================================================
# ML MODEL STORAGE
# ============================================================

ml_model = {}


# ============================================================
# LOAD MODEL AND THRESHOLDS
# ============================================================


@asynccontextmanager
async def lifespan(app: FastAPI):

    # Load calibrated XGBoost model
    ml_model["model"] = joblib.load("credit_risk_model.pkl")

    # Load Soft and Hard thresholds
    ml_model["thresholds"] = joblib.load("thresholds.pkl")

    print("Model and thresholds loaded successfully!")

    print("Soft Threshold:", ml_model["thresholds"]["soft_threshold"])

    print("Hard Threshold:", ml_model["thresholds"]["hard_threshold"])

    yield

    # Clear resources when application shuts down
    ml_model.clear()


# ============================================================
# CREATE FASTAPI APP
# ============================================================

app = FastAPI(
    title="Credit Risk Prediction API",
    description="Loan Default Prediction using Calibrated XGBoost",
    version="1.0.0",
    lifespan=lifespan,
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# INPUT DATA MODEL
# ============================================================


class LoanApplication(BaseModel):
    person_age: int
    person_income: float
    person_home_ownership: str
    person_emp_length: float
    loan_intent: str
    loan_grade: str
    loan_amnt: float
    loan_int_rate: float
    loan_percent_income: float
    cb_person_default_on_file: str
    cb_person_cred_hist_length: int

    # Dropdown in Swagger UI
    threshold_mode: Literal["soft", "hard"]


# ============================================================
# PREDICTION ENDPOINT
# ============================================================


@app.post("/predict")
def predict(data: LoanApplication):

    # --------------------------------------------------------
    # Get selected threshold mode
    # --------------------------------------------------------

    threshold_mode = data.threshold_mode

    # --------------------------------------------------------
    # Select threshold
    # --------------------------------------------------------

    threshold = ml_model["thresholds"][f"{threshold_mode}_threshold"]

    # --------------------------------------------------------
    # Convert input data into dictionary
    # --------------------------------------------------------

    input_data = data.model_dump()

    # Remove threshold_mode because it is NOT an ML feature
    input_data.pop("threshold_mode")

    # --------------------------------------------------------
    # Create DataFrame
    # --------------------------------------------------------

    input_df = pd.DataFrame([input_data])

    # --------------------------------------------------------
    # Predict default probability
    # --------------------------------------------------------

    probability = ml_model["model"].predict_proba(input_df)[:, 1][0]

    # --------------------------------------------------------
    # Apply selected threshold
    # --------------------------------------------------------

    prediction = int(probability >= threshold)

    # --------------------------------------------------------
    # Return result
    # --------------------------------------------------------

    return {
        "default_probability": round(float(probability), 4),
        "default_prediction": prediction,
        "threshold_mode": threshold_mode,
        "threshold_used": threshold,
        "Result": "High Risk" if prediction == 1 else "Low Risk",
    }


# ============================================================
# STATIC FRONTEND
# ============================================================

app.mount("/", StaticFiles(directory="static", html=True), name="static")
