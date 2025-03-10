import express from "express";
import {
  allLatestBlogCount,
  createBlog,
  getBlog,
  latestBlog,
  searchBlogs,
  searchBlogsCount,
  trendingBlogs,
} from "../controller/blogController.js";
import { verifyJWT } from "../utils/verifyJWT.js";
const router = express.Router();

router.route("/latest-blogs").post(latestBlog);
router.route("/all-latest-blogs-count").post(allLatestBlogCount);
router.route("/trending-blogs").get(trendingBlogs);
router.route("/search-blogs").post(searchBlogs);
router.route("/search-blogs-count").post(searchBlogsCount);
router.route("/create-blog").post(verifyJWT, createBlog);
router.route("/get-blog").post(getBlog);

export default router;
