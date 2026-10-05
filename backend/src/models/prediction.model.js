import mongoose from 'mongoose';

const predictionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    predictionType: {
        type: String,
        required: true,
        trim: true
    },
    stage: {
        type: String,
        enum: ["classification", "risk", "manual"],
        default: "manual"
    },
    predictedDisease: {
        type: String,
        trim: true
    },
    parentPrediction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "prediction"
    },
    inputData: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    result: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    status: {
        type: String,
        enum: ["completed", "failed"],
        default: "completed"
    }
}, { timestamps: true })

export const prediction = mongoose.model('prediction', predictionSchema)
