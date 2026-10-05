import {Router} from 'express';
import {
    createPrediction,
    getMyPredictions,
    getPredictionsById
} from '../controllers/prediction.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router()

router.route("/create").post(verifyJWT, createPrediction)

// secured routes
router.route("/history").get(verifyJWT, getMyPredictions)
router.route("/:id").get(verifyJWT, getPredictionsById)

export default router
