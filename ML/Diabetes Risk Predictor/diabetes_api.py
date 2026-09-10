from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Literal
import pickle
import pandas as pd

app = FastAPI(title="Diabetes Risk Predictor API")

# Load the trained XGBoost model once when the server starts
try:
    with open("model.pkl", "rb") as f:
        model = pickle.load(f)
except Exception as e:
    raise RuntimeError(f"Failed to load model: {e}")

# Mappings used to encode categorical inputs the same way the notebook did
LEVEL_MAP = {"Low": 1, "Moderate": 2, "High": 3}
DIET_MAP = {"Poor": 1, "Average": 2, "Healthy": 3}
SMOKING_MAP = {"Former": 1, "Current": 2, "Never": 3}
ALCOHOL_MAP = {"Frequently": 2, "Occasionally": 1, "Never": 3}
YES_NO_MAP = {"Yes": 1, "No": 0}
ADHERENCE_MAP = {"Good": 2, "Average": 1, "Poor": 0}
RESIDENCE_MAP = {"Urban": 0, "Rural": 1}


# Pydantic model defines and validates the expected request body
class PatientData(BaseModel):
    Age: float
    Height_cm: float
    Weight_kg: float
    BMI: float
    Waist_Circumference_cm: float
    Blood_Glucose: float
    HbA1c: float
    Fasting_Blood_Sugar: float
    Insulin_Level: float
    Blood_Pressure_Systolic: int
    Blood_Pressure_Diastolic: int
    Total_Cholesterol: float
    HDL: float
    LDL: float
    Triglycerides: float
    Heart_Rate: int
    Physical_Activity_Level: Literal["Low", "Moderate", "High"]
    Exercise_Hours_Per_Week: float
    Daily_Walking_Minutes: float
    Diet_Quality: Literal["Poor", "Average", "Healthy"]
    Sugar_Intake_Level: Literal["Low", "Moderate", "High"]
    Sleep_Hours: float
    Stress_Level: Literal["Low", "Moderate", "High"]
    Smoking_Status: Literal["Former", "Current", "Never"]
    Alcohol_Consumption: Literal["Frequently", "Occasionally", "Never"]
    Family_History_Diabetes: Literal["Yes", "No"]
    Hypertension: Literal["Yes", "No"]
    Fatty_Liver: Literal["Yes", "No"]
    PCOS: Literal["Yes", "No"]
    Medication_Adherence: Literal["Good", "Average", "Poor"]
    Work_Type: str = Field(..., examples=["Private", "Government", "Business", "Retired"])
    Residence_Type: Literal["Urban", "Rural"]
    Daily_Water_Intake_L: float


@app.get("/")
def home():
    return {"message": "Diabetes Risk Predictor API is running"}


@app.post("/predict")
def predict(data: PatientData):
    try:
        # Build a single-row DataFrame with columns in the same order the model was trained on
        row = {
            "Age": data.Age,
            "Height_cm": data.Height_cm,
            "Weight_kg": data.Weight_kg,
            "BMI": data.BMI,
            "Waist_Circumference_cm": data.Waist_Circumference_cm,
            "Blood_Glucose": data.Blood_Glucose,
            "HbA1c": data.HbA1c,
            "Fasting_Blood_Sugar": data.Fasting_Blood_Sugar,
            "Insulin_Level": data.Insulin_Level,
            "Blood_Pressure_Systolic": data.Blood_Pressure_Systolic,
            "Blood_Pressure_Diastolic": data.Blood_Pressure_Diastolic,
            "Total_Cholesterol": data.Total_Cholesterol,
            "HDL": data.HDL,
            "LDL": data.LDL,
            "Triglycerides": data.Triglycerides,
            "Heart_Rate": data.Heart_Rate,
            "Physical_Activity_Level": LEVEL_MAP[data.Physical_Activity_Level],
            "Exercise_Hours_Per_Week": data.Exercise_Hours_Per_Week,
            "Daily_Walking_Minutes": data.Daily_Walking_Minutes,
            "Diet_Quality": DIET_MAP[data.Diet_Quality],
            "Sugar_Intake_Level": LEVEL_MAP[data.Sugar_Intake_Level],
            "Sleep_Hours": data.Sleep_Hours,
            "Stress_Level": LEVEL_MAP[data.Stress_Level],
            "Smoking_Status": SMOKING_MAP[data.Smoking_Status],
            "Alcohol_Consumption": ALCOHOL_MAP[data.Alcohol_Consumption],
            "Family_History_Diabetes": YES_NO_MAP[data.Family_History_Diabetes],
            "Hypertension": YES_NO_MAP[data.Hypertension],
            "Fatty_Liver": YES_NO_MAP[data.Fatty_Liver],
            "PCOS": YES_NO_MAP[data.PCOS],
            "Medication_Adherence": ADHERENCE_MAP[data.Medication_Adherence],
            "Work_Type": data.Work_Type,
            "Residence_Type": RESIDENCE_MAP[data.Residence_Type],
            "Daily_Water_Intake_L": data.Daily_Water_Intake_L,
        }

        df = pd.DataFrame([row])
        df["Work_Type"] = df["Work_Type"].astype("category")

        prediction = model.predict(df)[0]

        return {"predicted_diabetes_risk_score": float(prediction)}

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction failed: {e}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("diabetes_api:app", host="0.0.0.0", port=8000, reload=True)
