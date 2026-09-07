import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
    registerUser,
    loginUser,
    logoutUser,
    updateAccountDetails,
    getHistory,
    changeCurrentPassword
} from '../controllers/user.controller.js';

const router = Router()

router.route("/register").post(registerUser)

// secured routes
router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/update-account").post(verifyJWT, updateAccountDetails)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/history").get(verifyJWT, getHistory)


export default router
