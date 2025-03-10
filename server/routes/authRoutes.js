import express from "express";
import { googleAuth, signin, signup } from "../controller/authController.js";

const router = express.Router();

router.route("/signup").post(signup);
router.route("/signin").post(signin);
router.route("/google-auth").post(googleAuth);
export default router;
