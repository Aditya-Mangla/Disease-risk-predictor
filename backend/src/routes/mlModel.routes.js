import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    diseasePrediction,
    heartAttackRiskPrediction,
    strokeRiskPrediction,
    diabetesRiskPrediction
} from '../controllers/mlModel.controller.js';

const router = Router()

// secured routes
router.route("/disease-prediction").post(verifyJWT, diseasePrediction)
router.route("/heart-attack-risk").post(verifyJWT, heartAttackRiskPrediction)
router.route("/stroke-risk").post(verifyJWT, strokeRiskPrediction)
router.route("/diabetes-risk").post(verifyJWT, diabetesRiskPrediction)


export default router
