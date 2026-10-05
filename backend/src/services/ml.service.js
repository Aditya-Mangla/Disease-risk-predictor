import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { AsyncHandler } from '../utils/AsyncHandler.js';

const requestTimeoutMs = Number(process.env.ML_REQUEST_TIMEOUT_MS || 10000);

const requiredFields = {
    disease: ['symptoms'],
    heart: [
        'male', 'age', 'currentSmoker', 'cigsPerDay', 'BPMeds',
        'prevalentStroke', 'prevalentHyp', 'diabetes', 'totChol',
        'sysBP', 'diaBP', 'BMI', 'TenYearCHD'
    ],
    stroke: [
        'age', 'gender', 'high_blood_pressure', 'irregular_heartbeat',
        'shortness_of_breath', 'chest_pain', 'fatigue_weakness',
        'dizziness', 'snoring_sleep_apnea', 'swelling_edema'
    ],
    diabetes: [
        'Age', 'Height_cm', 'Weight_kg', 'BMI', 'Waist_Circumference_cm',
        'Blood_Glucose', 'HbA1c', 'Fasting_Blood_Sugar', 'Insulin_Level',
        'Blood_Pressure_Systolic', 'Blood_Pressure_Diastolic',
        'Total_Cholesterol', 'HDL', 'LDL', 'Triglycerides', 'Heart_Rate',
        'Physical_Activity_Level', 'Exercise_Hours_Per_Week',
        'Daily_Walking_Minutes', 'Diet_Quality', 'Sugar_Intake_Level',
        'Sleep_Hours', 'Stress_Level', 'Smoking_Status',
        'Alcohol_Consumption', 'Family_History_Diabetes', 'Hypertension',
        'Fatty_Liver', 'PCOS', 'Medication_Adherence', 'Work_Type',
        'Residence_Type', 'Daily_Water_Intake_L'
    ]
};

const validateInput = (modelType, input) => {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
        throw new ApiError(400, 'Prediction data must be a JSON object');
    }

    const missingFields = requiredFields[modelType].filter((field) => {
        return input[field] === undefined || input[field] === null;
    });

    if (missingFields.length > 0) {
        throw new ApiError(400, `Missing prediction fields: ${missingFields.join(', ')}`);
    }

    if (modelType === 'disease' && (!Array.isArray(input.symptoms) || input.symptoms.length === 0)) {
        throw new ApiError(400, 'Symptoms must be a non-empty array');
    }
};

const predictWithModel = async (modelUrl, input) => {
    if (!modelUrl) {
        throw new ApiError(503, 'Prediction service is not configured');
    }

    if (!input || typeof input !== 'object' || Array.isArray(input)) {
        throw new ApiError(400, 'Prediction data must be a JSON object');
    }

    if (Object.keys(input).length === 0) {
        throw new ApiError(400, 'Prediction data cannot be empty');
    }

    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), requestTimeoutMs);

    try {
        const modelResponse = await fetch(modelUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input),
            signal: abortController.signal
        });

        const responseText = await modelResponse.text();
        let modelData;

        try {
            modelData = JSON.parse(responseText);
        } catch {
            throw new ApiError(502, 'Prediction service returned invalid JSON');
        }

        if (!modelResponse.ok) {
            throw new ApiError(502, 'Prediction service rejected the request', modelData);
        }

        return modelData;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        if (error.name === 'AbortError') {
            throw new ApiError(504, 'Prediction service request timed out');
        }

        throw new ApiError(503, 'Unable to reach prediction service');
    } finally {
        clearTimeout(timeout);
    }
};

const getFollowUp = (disease) => {
    const normalizedDisease = String(disease || '').toLowerCase();

    if (normalizedDisease.includes('diabet')) {
        return { disease: 'diabetes', endpoint: '/diabetes-risk' };
    }

    if (normalizedDisease.includes('heart') || normalizedDisease.includes('cardiac')) {
        return { disease: 'heart', endpoint: '/heart-attack-risk' };
    }

    if (normalizedDisease.includes('stroke')) {
        return { disease: 'stroke', endpoint: '/stroke-risk' };
    }

    return null;
};

const followUpMatchesModel = (disease, modelType) => {
    const followUp = getFollowUp(disease);
    return followUp?.disease === modelType;
};

const handlePrediction = (modelEnvironmentVariable, predictionType, modelType) => AsyncHandler(async (req, res) => {
    validateInput(modelType, req.body);

    const predictedDisease = req.header('X-Predicted-Disease');

    if (modelType !== 'disease') {
        if (!predictedDisease) {
            throw new ApiError(400, 'X-Predicted-Disease header is required for risk prediction');
        }

        if (!followUpMatchesModel(predictedDisease, modelType)) {
            throw new ApiError(400, 'Selected risk model does not match the predicted disease');
        }
    }

    const modelResult = await predictWithModel(
        process.env[modelEnvironmentVariable],
        req.body
    );

    const followUp = modelType === 'disease'
        ? getFollowUp(modelResult.predicted_disease)
        : null;

    const responseData = modelType === 'disease'
        ? { ...modelResult, followUp }
        : modelResult;

    return res
    .status(200)
    .json(
        new ApiResponse(200, responseData, `${predictionType} prediction completed successfully`)
    );
});


const diseasePrediction = handlePrediction(
    'DISEASE_MODEL_URL',                                // Add the Disease model URL here.
    'Disease classification',
    'disease'
);

const heartAttackRiskPrediction = handlePrediction(
    'HEART_MODEL_URL',                                  // Add the Heart model URL here.
    'Heart disease risk',
    'heart'
);

const strokeRiskPrediction = handlePrediction(
    'STROKE_MODEL_URL',                                 // Add the Stroke model URL here.
    'Stroke risk',
    'stroke'
);

const diabetesRiskPrediction = handlePrediction(
    'DIABETES_MODEL_URL',                               // Add the Diabetes model URL here.
    'Diabetes risk',
    'diabetes'
);

export {
    diseasePrediction,
    heartAttackRiskPrediction,
    strokeRiskPrediction,
    diabetesRiskPrediction
}
