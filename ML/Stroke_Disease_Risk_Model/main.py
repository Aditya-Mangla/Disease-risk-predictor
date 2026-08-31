from fastapi import  FastAPI 
from pydantic import BaseModel
import pandas as pd 
import joblib 

app = FastAPI(title= "Stroke Disease Risk Model", description = "This is a stroke disease risk model which predicts the risk of stroke based on values of different features")
import os
import joblib

# Location of main.py
current_folder = os.path.dirname(os.path.abspath(__file__))

# Location of stroke_model.pkl
model_file = os.path.join(current_folder, "stroke_model.pkl")

# Load model
model = joblib.load(model_file)
class StrokeInput(BaseModel):
    age: float
    gender: float
    high_blood_pressure: float
    irregular_heartbeat: float
    shortness_of_breath: float
    chest_pain: float
    fatigue_weakness: float
    dizziness: float
    snoring_sleep_apnea: float
    swelling_edema: float

@app.get("/")
def home():
    return {
        "message": "Stroke Risk Prediction API is running"
    }

@app.post("/predict")
def predict(data: StrokeInput):

    input_dict = {
        "age": data.age,
        "gender": data.gender,
        "high_blood_pressure": data.high_blood_pressure,
        "irregular_heartbeat": data.irregular_heartbeat,
        "shortness_of_breath": data.shortness_of_breath,
        "chest_pain": data.chest_pain,
        "fatigue_weakness": data.fatigue_weakness,
        "dizziness": data.dizziness,
        "snoring_sleep_apnea": data.snoring_sleep_apnea,
        "swelling_edema": data.swelling_edema
    }

    input_df = pd.DataFrame([input_dict])

    prediction = model.predict(input_df)[0]

    risk_percentage = round(float(prediction), 2)

    return {
        "stroke_risk_percentage": risk_percentage
    }

