import { Router } from "express";
import {
    diseasePrediction,
    heartAttackRiskPrediction,
    strokeRiskPrediction,
    diabetesRiskPrediction
} from '../services/ml.service.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router()

router.route("/disease-prediction").post(verifyJWT, diseasePrediction)
router.route("/heart-attack-risk").post(verifyJWT, heartAttackRiskPrediction)
router.route("/stroke-risk").post(verifyJWT, strokeRiskPrediction)
router.route("/diabetes-risk").post(verifyJWT, diabetesRiskPrediction)


export default router
