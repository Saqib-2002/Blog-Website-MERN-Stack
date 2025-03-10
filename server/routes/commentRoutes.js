import express from "express";
import { verifyJWT } from "../utils/verifyJWT.js";
import { addComment, getBlogComment } from "../controller/commentController.js";

const router = express.Router();

router.route("/add-comment").post(verifyJWT, addComment);
router.route("/get-blog-comments").post(getBlogComment);

export default router;
