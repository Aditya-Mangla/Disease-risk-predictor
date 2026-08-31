from fastapi import FastAPI 
from pydantic import BaseModel
import joblib 
import pandas as pd 
import os
app = FastAPI(
    title="Heart Disease Risk Prediction API",
    description="API for predicting heart disease risk based on symptoms",
    version="1.0"
)
current_folder = os.path.dirname(os.path.abspath(__file__))

# Location of stroke_model.pkl
model_file = os.path.join(current_folder, "heart_model.pkl")

# Load model
model = joblib.load(model_file)
class HeartDiseaseInput(BaseModel):
    male :int
    age:int
    currentSmoker:int
    cigsPerDay:float
    BPMeds: int
    prevalentStroke:int
    prevalentHyp:int
    diabetes:int
    totChol:float
    sysBP:float
    diaBP:float
    BMI:float
    TenYearCHD:float

@app.get("/")
def home():
    return {"message": "Welcome to the Heart Disease Risk Prediction API!"}

@app.post("/predict")
def predict_risk(data: HeartDiseaseInput):
    # Convert input data to DataFrame
    input_data = pd.DataFrame([data.dict()])
    
    # Make prediction
    prediction = model.predict(input_data)
    
    # Return the prediction result
    return {"prediction": int(prediction[0])}
# this is the file for heart disease risk prediction api using fastapi and pydantic. it loads the model from 
# heart_model.pkl and defines an endpoint for predicting heart disease risk based on input features.