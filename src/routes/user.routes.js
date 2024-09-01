import { Router } from "express";
import { loginUser, registerUser, logoutUser, refreshAccessToken, requestOTP, verifyOTP } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router();

router.route("/register").post(registerUser)

router.route("/login").post(loginUser)

// secured routes
router.route("/logout").post(verifyJWT,logoutUser)

router.route("/refresh-token").post(refreshAccessToken)

// Routes for OTP
router.route("/request-otp").post(requestOTP);
router.route("/verify-otp").post(verifyOTP);

export default router;