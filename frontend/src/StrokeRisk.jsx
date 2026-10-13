import React, { useState } from "react";
import "./appN.css";

const initialData = {
  age: "",
  gender: "",
  high_blood_pressure: "",
  irregular_heartbeat: "",
  shortness_of_breath: "",
  chest_pain: "",
  fatigue_weakness: "",
  dizziness: "",
  snoring_sleep_apnea: "",
  swelling_edema: "",
};

function StrokeRisk() {
  const [data, setData] = useState(initialData);
  const [step, setStep] = useState(1);
  const [riskScore, setRiskScore] = useState(null);
  const [loading, setLoading] = useState(false);

  const updateData = (field, value) => {
    setData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const nextStep = () => {
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const previousStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const submitAssessment = async () => {
    setLoading(true);

    /*
      MOCK PREDICTION FOR NOW

      Your Python API returns:
      {
        "stroke_risk_percentage": risk_percentage
      }

      Once the backend is connected, this mock section
      can be replaced with fetch().
    */

    const mockResponse = {
      stroke_risk_percentage: 32.5,
    };

    await new Promise((resolve) => setTimeout(resolve, 1000));

    setRiskScore(mockResponse.stroke_risk_percentage);
    setLoading(false);
    setStep(5);
  };

  const resetAssessment = () => {
    setData(initialData);
    setRiskScore(null);
    setStep(1);
  };

  return (
    <div className="stroke-page">

      {/* HEADER */}
      <div className="stroke-header">
        <div>
          <span className="assessment-label">STROKE RISK ASSESSMENT</span>
          <h1>Stroke Risk Assessment</h1>
          <p>
            Answer a few questions about your health and symptoms.
          </p>
        </div>

        {step <= 4 && (
          <div className="progress-info">
            Step {step} of 4
          </div>
        )}
      </div>

      {/* PROGRESS BAR */}
      {step <= 4 && (
        <div className="progress-bar-container">
          <div
            className="progress-bar"
            style={{
              width: `${(step / 4) * 100}%`,
            }}
          ></div>
        </div>
      )}

      {/* ================= STEP 1 ================= */}
      {step === 1 && (
        <div className="assessment-card">
          <div className="step-heading">
            <span>01</span>
            <div>
              <h2>Basic Information</h2>
              <p>Tell us some basic information about yourself.</p>
            </div>
          </div>

          <div className="question-grid">

            <div className="question">
              <label>What is your age?</label>

              <input
                type="number"
                min="1"
                max="120"
                placeholder="Enter your age"
                value={data.age}
                onChange={(e) =>
                  updateData("age", e.target.value)
                }
              />
            </div>

            <div className="question">
              <label>What is your gender?</label>

              <select
                value={data.gender}
                onChange={(e) =>
                  updateData("gender", e.target.value)
                }
              >
                <option value="">Select gender</option>
                <option value="0">Female</option>
                <option value="1">Male</option>
              </select>
            </div>

          </div>

          <NavigationButton
            onClick={nextStep}
            disabled={!data.age || data.gender === ""}
          >
            Continue
          </NavigationButton>
        </div>
      )}

      {/* ================= STEP 2 ================= */}
      {step === 2 && (
        <div className="assessment-card">

          <div className="step-heading">
            <span>02</span>
            <div>
              <h2>Blood & Heart Health</h2>
              <p>
                Tell us about conditions related to your cardiovascular health.
              </p>
            </div>
          </div>

          <div className="question-grid">

            <YesNoQuestion
              label="Do you have high blood pressure?"
              value={data.high_blood_pressure}
              onChange={(value) =>
                updateData("high_blood_pressure", value)
              }
            />

            <YesNoQuestion
              label="Do you have an irregular heartbeat?"
              value={data.irregular_heartbeat}
              onChange={(value) =>
                updateData("irregular_heartbeat", value)
              }
            />

            <YesNoQuestion
              label="Do you experience shortness of breath?"
              value={data.shortness_of_breath}
              onChange={(value) =>
                updateData("shortness_of_breath", value)
              }
            />

            <YesNoQuestion
              label="Do you experience chest pain?"
              value={data.chest_pain}
              onChange={(value) =>
                updateData("chest_pain", value)
              }
            />

          </div>

          <NavigationButtons
            onBack={previousStep}
            onNext={nextStep}
          />
        </div>
      )}

      {/* ================= STEP 3 ================= */}
      {step === 3 && (
        <div className="assessment-card">

          <div className="step-heading">
            <span>03</span>
            <div>
              <h2>Symptoms & Physical Signs</h2>
              <p>
                Answer the following questions about symptoms you may experience.
              </p>
            </div>
          </div>

          <div className="question-grid">

            <YesNoQuestion
              label="Do you experience unusual fatigue or weakness?"
              value={data.fatigue_weakness}
              onChange={(value) =>
                updateData("fatigue_weakness", value)
              }
            />

            <YesNoQuestion
              label="Do you experience dizziness?"
              value={data.dizziness}
              onChange={(value) =>
                updateData("dizziness", value)
              }
            />

            <YesNoQuestion
              label="Do you snore heavily or have sleep apnea?"
              value={data.snoring_sleep_apnea}
              onChange={(value) =>
                updateData("snoring_sleep_apnea", value)
              }
            />

            <YesNoQuestion
              label="Do you experience swelling or edema?"
              value={data.swelling_edema}
              onChange={(value) =>
                updateData("swelling_edema", value)
              }
            />

          </div>

          <NavigationButtons
            onBack={previousStep}
            onNext={nextStep}
          />
        </div>
      )}

      {/* ================= STEP 4 ================= */}
      {step === 4 && (
        <div className="assessment-card">

          <div className="step-heading">
            <span>04</span>
            <div>
              <h2>Review Assessment</h2>
              <p>
                Review your answers before calculating the risk score.
              </p>
            </div>
          </div>

          <div className="review-grid">

            <ReviewItem
              label="Age"
              value={data.age}
            />

            <ReviewItem
              label="Gender"
              value={data.gender === "1" ? "Male" : "Female"}
            />

            <ReviewItem
              label="High Blood Pressure"
              value={data.high_blood_pressure === "1" ? "Yes" : "No"}
            />

            <ReviewItem
              label="Irregular Heartbeat"
              value={data.irregular_heartbeat === "1" ? "Yes" : "No"}
            />

            <ReviewItem
              label="Shortness of Breath"
              value={data.shortness_of_breath === "1" ? "Yes" : "No"}
            />

            <ReviewItem
              label="Chest Pain"
              value={data.chest_pain === "1" ? "Yes" : "No"}
            />

            <ReviewItem
              label="Fatigue / Weakness"
              value={data.fatigue_weakness === "1" ? "Yes" : "No"}
            />

            <ReviewItem
              label="Dizziness"
              value={data.dizziness === "1" ? "Yes" : "No"}
            />

            <ReviewItem
              label="Snoring / Sleep Apnea"
              value={data.snoring_sleep_apnea === "1" ? "Yes" : "No"}
            />

            <ReviewItem
              label="Swelling / Edema"
              value={data.swelling_edema === "1" ? "Yes" : "No"}
            />

          </div>

          <div className="button-row">

            <button
              className="secondary-button"
              onClick={previousStep}
            >
              ← Back
            </button>

            <button
              className="primary-button"
              onClick={submitAssessment}
              disabled={loading}
            >
              {loading ? "Calculating..." : "Check Stroke Risk"}
            </button>

          </div>

        </div>
      )}

      {/* ================= RESULT ================= */}
      {step === 5 && (
        <div className="result-card">

          <div className="result-icon">
            ✓
          </div>

          <span className="assessment-label">
            ASSESSMENT COMPLETE
          </span>

          <h2>Your Stroke Risk Score</h2>

          <div className="risk-score">
            {riskScore}%
          </div>

          <div className="risk-status">
            {riskScore < 30
              ? "Lower Risk"
              : riskScore < 60
              ? "Moderate Risk"
              : "Higher Risk"}
          </div>

          <p className="result-message">
            This is a demonstration score generated by the current
            frontend mock prediction. It is not a medical diagnosis
            or a real clinical prediction.
          </p>

          <button
            className="primary-button"
            onClick={resetAssessment}
          >
            Take Assessment Again
          </button>

        </div>
      )}

    </div>
  );
}


/* ================= REUSABLE COMPONENTS ================= */

function YesNoQuestion({ label, value, onChange }) {
  return (
    <div className="question">
      <label>{label}</label>

      <div className="option-row">

        <button
          type="button"
          className={`option-button ${
            value === "1" ? "selected" : ""
          }`}
          onClick={() => onChange("1")}
        >
          Yes
        </button>

        <button
          type="button"
          className={`option-button ${
            value === "0" ? "selected" : ""
          }`}
          onClick={() => onChange("0")}
        >
          No
        </button>

      </div>
    </div>
  );
}


function ReviewItem({ label, value }) {
  return (
    <div className="review-item">
      <span>{label}</span>
      <strong>{value || "-"}</strong>
    </div>
  );
}


function NavigationButton({
  children,
  onClick,
  disabled = false,
}) {
  return (
    <div className="button-row next-only">
      <button
        className="primary-button"
        onClick={onClick}
        disabled={disabled}
      >
        {children} →
      </button>
    </div>
  );
}


function NavigationButtons({ onBack, onNext }) {
  return (
    <div className="button-row">

      <button
        className="secondary-button"
        onClick={onBack}
      >
        ← Back
      </button>

      <button
        className="primary-button"
        onClick={onNext}
      >
        Continue →
      </button>

    </div>
  );
}

export default StrokeRisk;