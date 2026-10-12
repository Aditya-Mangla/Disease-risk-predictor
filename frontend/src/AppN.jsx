
import React, { useState } from "react";

import DiabetesRisk from "./DiabetesRisk";
import HeartRisk from "./HeartRisk";
import StrokeRisk from "./StrokeRisk";

function App() {
  const [predictedDisease, setPredictedDisease] = useState(null);
  const [selectedDisease, setSelectedDisease] = useState(null);

  // Temporary prediction logic
  // Later this will be replaced with the actual initial-assessment API.
  const runInitialPrediction = () => {
    const prediction = "stroke";

    setPredictedDisease(prediction);
  };

  // Open the detailed assessment for the predicted disease
  if (selectedDisease === "diabetes") {
    return <DiabetesRisk />;
  }

  if (selectedDisease === "heart") {
    return <HeartRisk />;
  }

  if (selectedDisease === "stroke") {
    return <StrokeRisk />;
  }

  // Initial assessment screen
  if (!predictedDisease) {
    return (
      <div className="prediction-page">
        <div className="prediction-card">
          <span className="assessment-label">
            DISEASE RISK ASSESSMENT
          </span>

          <h1>Initial Health Assessment</h1>

          <p>
            Complete the initial assessment to identify the
            disease for which a detailed risk assessment is available.
          </p>

          <button
            className="primary-button"
            onClick={runInitialPrediction}
          >
            Submit Assessment →
          </button>
        </div>
      </div>
    );
  }

  const diseaseName =
    predictedDisease === "diabetes"
      ? "Diabetes"
      : predictedDisease === "heart"
      ? "Heart Disease"
      : "Stroke";

  return (
    <div className="prediction-page">
      <div className="prediction-card">
        <span className="assessment-label">
          INITIAL ASSESSMENT COMPLETE
        </span>

        <h1>Predicted Disease</h1>

        <h2>{diseaseName}</h2>

        <p>
          Based on the initial assessment, the predicted disease
          is <strong>{diseaseName}</strong>.
        </p>

        <p>
          Continue with the detailed assessment to calculate
          the disease-specific risk score.
        </p>

        <button
          className="primary-button"
          onClick={() => setSelectedDisease(predictedDisease)}
        >
          Check {diseaseName} Risk →
        </button>
      </div>
    </div>
  );
}

export default App;
