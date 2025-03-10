import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import likeRoutes from "./routes/likeRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

const app = express();
let PORT = 3000;
app.use(express.json()); // it allows your app to automatically parse JSON data sent in the request body.

// implementation of middleware in an Express.js app application.
app.use((req, res, next) => {
  console.log(`Received ${req.method} request to ${req.url}`);
  next();
});

// CORS - Cross-Origin Resource Sharing
app.use(
  cors({
    origin: process.env.FRONT_END_URL, // frontend URL
    methods: "GET, POST, PUT, DELETE",
    credentials: true,
  })
);

connectDB(); // mongoDB connection custom method.

app.use("/api/auth", authRoutes); // authRoutes for auhtentication
app.use("/api/user", userRoutes); // userRoutes for user changes
app.use(blogRoutes); // blogRoutes for blogs CRUD, Search & like, comments
app.use(commentRoutes);
app.use(likeRoutes);
app.use(uploadRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal app error", details: err.message });
});

// Listening to Port
app.listen(PORT, () => {
  console.log("Listening on port: " + PORT);
});
