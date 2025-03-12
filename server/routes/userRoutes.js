import express from "express";
import {
  changePassword,
  getProfile,
  searchUser,
  updateProfile,
} from "../controller/userController.js";
import { verifyJWT } from "../utils/verifyJWT.js";

const router = express.Router();

router.route("/search-user").post(searchUser);
router.route("/get-profile/:username").get(getProfile);
router.route("/change-passwod").put(changePassword);
router.route("/update-profile").put(verifyJWT, updateProfile);

export default router;
