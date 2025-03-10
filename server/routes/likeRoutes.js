import express from "express";
import { verifyJWT } from "../utils/verifyJWT.js";
import { isLikedByUser, likeBlog } from "../controller/likeController.js";

const router = express.Router();

router.route("/like-blog").post(verifyJWT, likeBlog);
router.route("/isliked-by-user").post(verifyJWT, isLikedByUser);
export default router;
