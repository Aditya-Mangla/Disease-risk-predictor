from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import numpy as np

app = FastAPI(title="Disease Prediction API")

# Load the trained model once when the server starts
try:
    model = joblib.load("my_model.joblib")
except Exception as e:
    raise RuntimeError(f"Failed to load model: {e}")

# The 44 symptom columns the model was trained on, in order
FEATURES = list(model.feature_names_in_)


# Pydantic model defines and validates the expected request body
class SymptomInput(BaseModel):
    symptoms: list[str]


@app.get("/")
def home():
    return {"message": "Disease Prediction API is running"}


@app.post("/predict")
def predict(data: SymptomInput):
    try:
        # Build the binary feature vector from the symptom names sent in
        input_vector = [1 if feature in data.symptoms else 0 for feature in FEATURES]
        input_array = np.array(input_vector).reshape(1, -1)

        prediction = model.predict(input_array)[0]

        return {"predicted_disease": prediction}

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction failed: {e}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main_basic:app", host="0.0.0.0", port=8000, reload=True)
