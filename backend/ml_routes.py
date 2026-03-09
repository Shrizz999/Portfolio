from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd
import os

router = APIRouter()

# Precise Pathing for your ASUS TUF F17 setup
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Note the addition of "ml" in the path below
MODEL_PATH = os.path.join(BASE_DIR, "models", "ml", "rfc", "RFC.pkl")
COLUMNS_PATH = os.path.join(BASE_DIR, "models", "ml", "rfc", "columns.pkl")

try:
    rfc_model = joblib.load(MODEL_PATH)
    expected_columns = joblib.load(COLUMNS_PATH)
    print("✅ Lung Cancer RFC Model loaded successfully.")
except Exception as e:
    print(f"❌ Error loading ML models: {e}")
    rfc_model = None
    expected_columns = None

class PredictionRequest(BaseModel):
    AGE: int
    GENDER_M: int
    SMOKING: int
    YELLOW_FINGERS: int
    ANXIETY: int
    CHRONIC_DISEASE: int
    FATIGUE: int
    ALLERGY: int
    WHEEZING: int
    ALCOHOL_CONSUMING: int
    COUGHING: int
    SHORTNESS_OF_BREATH: int
    SWALLOWING_DIFFICULTY: int
    CHEST_PAIN: int

@router.post("/predict/lung-cancer")
async def predict_lung_cancer(data: PredictionRequest):
    if rfc_model is None:
        raise HTTPException(status_code=500, detail="ML model not found on server.")

    try:
        input_dict = data.dict()
        df = pd.DataFrame([input_dict])
        
        # Ensure the column order matches the training data
        df = df[expected_columns]

        prediction = rfc_model.predict(df)[0]
        proba = float(rfc_model.predict_proba(df)[0][1])

        return {
            "prediction": int(prediction),
            "risk_level": "High Risk" if prediction == 1 else "Low Risk",
            "confidence": round(proba * 100, 2)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))