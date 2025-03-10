import express from "express";
import multer from "multer";
import cloudinary from "../utils/cloudinary.js";
import sharp from "sharp";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/uploads", upload.single("file"), async (req, res) => {
  try {
    // console.log("File received:", req.file); // Logs file details

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    // Resize and compress image using sharp
    const optimizedImage = await sharp(req.file.buffer)
      .resize({ width: 800 }) // Resize width (height auto-adjusts)
      .jpeg({ quality: 70 }) // Convert to JPEG & reduce quality to 70%
      .toBuffer();

    // Upload image to Cloudinary using buffer stream
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "blog-banners" },
        (error, result) => {
          if (error) {
            console.error("Cloudinary Error:", error);
            reject(error);
          } else {
            console.log("Cloudinary Upload Result:", result); // Debugging
            resolve(result);
          }
        }
      );

      uploadStream.end(optimizedImage);
    });
    res.json({ success: true, image_url: result.secure_url });
  } catch (error) {
    res.status(500).json({ error: "Upload failed", details: error.message });
  }
});

export default router;
