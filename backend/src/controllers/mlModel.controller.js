import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { AsyncHandler } from '../utils/AsyncHandler.js';

const requestTimeoutMs = Number(process.env.ML_REQUEST_TIMEOUT_MS || 10000);

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

const handlePrediction = (modelEnvironmentVariable, predictionType) => AsyncHandler(async (req, res) => {
    const prediction = await predictWithModel(
        process.env[modelEnvironmentVariable],
        req.body
    );

    return res
    .status(200)
    .json(
        new ApiResponse(200, prediction, `${predictionType} prediction completed successfully`)
    );
});


const diseasePrediction = handlePrediction(
    'DISEASE_MODEL_URL',
    'Disease risk'
);

const heartAttackRiskPrediction = handlePrediction(
    'HEART_MODEL_URL',
    'Heart disease risk'
);

const strokeRiskPrediction = handlePrediction(
    'STROKE_MODEL_URL',
    'Stroke risk'
);

const diabetesRiskPrediction = handlePrediction(
    'DIABETES_MODEL_URL',
    'Diabetes risk'
);

export {
    diseasePrediction,
    heartAttackRiskPrediction,
    strokeRiskPrediction,
    diabetesRiskPrediction
}
