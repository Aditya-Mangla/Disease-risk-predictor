import {ApiError} from '../utils/ApiError.js';
import {ApiResponse} from '../utils/ApiResponse.js';
import {AsyncHandler} from '../utils/AsyncHandler.js';
import fs from 'fs';
import {prediction} from '../models/prediction.model.js';


const createPrediction = AsyncHandler(async (req, res) => {
    const { type, inputData, result, status, stage, predictedDisease, parentPrediction } = req.body

    if (!type) {
        throw new ApiError(400, 'Prediction type is required')
    }

    const userId = req.newUser?._id

    if (!userId) {
        throw new ApiError(401, 'Unauthorized request')
    }

    const predictionDoc = await prediction.create({
        user: userId,
        predictionType: type,
        stage,
        predictedDisease,
        parentPrediction,
        inputData: inputData || {},
        result: result || {},
        status: status || 'completed'
    })

    return res
        .status(201)
        .json(
            new ApiResponse(201, predictionDoc, 'Prediction created successfully')
        )
})

const getMyPredictions = AsyncHandler(async (req, res) => {
    const userId = req.newUser?._id || req.user?._id

    if (!userId) {
        throw new ApiError(401, 'Unauthorized request')
    }

    const predictionsList = await prediction.find({
         user: userId 
        }).sort({ createdAt: -1 })

    return res
        .status(200)
        .json(
            new ApiResponse(200, predictionsList, 'Predictions fetched successfully')
        )
})

const getPredictionsById = AsyncHandler(async (req, res) => {
    const { id } = req.params
    const userId = req.newUser?._id || req.user?._id

    if (!userId) {
        throw new ApiError(401, 'Unauthorized request')
    }

    const predictionDoc = await prediction.findOne({ _id: id, user: userId })

    if (!predictionDoc) {
        throw new ApiError(404, 'Prediction not found')
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, predictionDoc, 'Prediction fetched successfully')
        )
})

export {
    createPrediction,
    getMyPredictions,
    getPredictionsById
}
