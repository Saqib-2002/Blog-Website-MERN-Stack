import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import cors from "cors";
import dotenv from "dotenv";
import admin from "firebase-admin";
// import serviceAccountKey from "./blog-website-mern-stack-firebase-adminsdk-sb874-bbd8664920.json" assert { type: "json" };
import { getAuth } from "firebase-admin/auth";

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

// Schema import
import User from "./Schema/User.js";

const server = express();
let PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccountKeyPath = path.join(
  __dirname,
  "blog-website-mern-stack-firebase-adminsdk-sb874-bbd8664920.json"
);
console.log("Service account key path:", serviceAccountKeyPath); // Log the path
const serviceAccountKey = JSON.parse(
  fs.readFileSync(serviceAccountKeyPath, "utf8")
);

console.log(serviceAccountKey);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
});

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

server.use(express.json());
server.use(
  cors({
    origin: "http://localhost:5173", // replace with your frontend URL
    credentials: true,
  })
);

// Improved MongoDB connection with error logging
mongoose
  .connect(process.env.MONGODB_URI, { autoIndex: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit the process if unable to connect to the database
  });

const formatDatatoSend = (user) => {
  const access_token = jwt.sign(
    { id: user._id },
    process.env.SECRET_ACCESS_KEY
  );
  return {
    access_token,
    profile_img: user.personal_info.profile_img,
    username: user.personal_info.username,
    fullname: user.personal_info.fullname,
  };
};

const generateUsername = async (email) => {
  let username = email.split("@")[0];
  let isUsernameExists = await User.exists({
    "personal_info.username": username,
  }).then((result) => result);

  isUsernameExists ? (username += nanoid().substring(0, 3)) : "";
  return username;
};

server.post("/signup", async (req, res) => {
  try {
    const { fullname, email, password } = req.body;
    console.log("Received signup request:", {
      fullname,
      email,
      password: "******",
    });

    if (fullname.length < 3) {
      console.log("Fullname validation failed");
      return res.status(400).json({
        error: "Fullname must be at least 3 letters long",
        field: "fullname",
      });
    }

    if (!email.length) {
      console.log("Email empty");
      return res.status(400).json({ error: "Enter Email", field: "email" });
    }
    if (!emailRegex.test(email)) {
      console.log("Email validation failed");
      return res
        .status(400)
        .json({ error: "Email is invalid", field: "email" });
    }

    if (!passwordRegex.test(password)) {
      console.log("Password validation failed");
      return res.status(400).json({
        error:
          "Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters",
        field: "password",
      });
    }

    const existingUser = await User.findOne({ "personal_info.email": email });
    if (existingUser) {
      console.log("Email already exists");
      return res
        .status(400)
        .json({ error: "Email already exists", field: "email" });
    }

    const hashed_password = await bcrypt.hash(password, 10);
    const username = await generateUsername(email);

    const user = new User({
      personal_info: {
        fullname,
        email,
        password: hashed_password,
        username,
      },
    });

    await user.save();
    console.log("User saved successfully");
    res.status(201).json(formatDatatoSend(user));
  } catch (err) {
    console.error("Signup error:", err);
    res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
});

server.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Received signin request:", { email, password: "******" });

    const user = await User.findOne({ "personal_info.email": email });
    if (!user) {
      console.log("Email not found");
      return res.status(404).json({ error: "Email not found", field: "email" });
    }

    if (!user.google_auth) {
      const isPasswordValid = await bcrypt.compare(
        password,
        user.personal_info.password
      );
      if (!isPasswordValid) {
        console.log("Incorrect password");
        return res
          .status(401)
          .json({ error: "Incorrect Password", field: "password" });
      }
      console.log("Signin successful");
      res.status(200).json(formatDatatoSend(user));
    } else {
      return res.status(403).json({
        error: "Account was created using google. Try logging in with google",
      });
    }
  } catch (err) {
    console.error("Signin error:", err);
    res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
});

// Global error handler
server.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res
    .status(500)
    .json({ error: "Internal server error", details: err.message });
});

// google auth.

// server.post("/google-auth", async (req, res) => {
//   const { access_token } = req.body;

//   getAuth()
//     .verifyIdToken(access_token)
//     .then(async (decodedUser) => {
//       const { email, name, picture } = decodedUser;

//       picture = picture.replace("s96-c", "s384-c");
//       let user = await User.findOne({ "personal_info.email": email })
//         .select(
//           "personal_info.fullname personal_info.username personal_info.profile_img personal_info.google_auth"
//         )
//         .then((u) => {
//           return u || null;
//         })
//         .catch((err) => {
//           console.error("Error saving new Google user:", err);
//           return res.status(500).json({ error: err.message });
//         });

//       if (user) {
//         //login
//         if (!user.google_auth) {
//           return res.status(403).json({
//             error:
//               "This email was signed up without Google. Please log in with password.",
//           });
//         }
//       } else {
//         // signup
//         let username = await generateUsername(email);
//         user = new User({
//           personal_info: {
//             fullname: name,
//             email,
//             profile_img: picture,
//             username,
//           },
//           google_auth: true,
//         });

//         await user
//           .save((u) => {
//             user = u;
//           })
//           .catch((err) => {
//             console.error("Error saving new Google user:", err);
//             return res.status(500).json({ error: err.message });
//           });
//       }
//     })
//     .catch((err) => {
//       return res.status(500).json({ error: "Failed to authenticate you with google. Try some other google account." });
//     });
// });

server.post("/google-auth", async (req, res) => {
  try {
    let { access_token } = req.body;
    console.log(access_token);

    if (!access_token) {
      return res.status(400).json({ error: "No access token provided" });
    }

    const decodedUser = await getAuth().verifyIdToken(access_token);
    const { email, name, picture } = decodedUser;

    let updatedPicture = picture.replace("s96-c", "s384-c");

    let user = await User.findOne({ "personal_info.email": email }).select(
      "personal_info.fullname personal_info.username personal_info.profile_img personal_info.google_auth"
    );

    if (user) {
      if (!user.google_auth) {
        return res.status(403).json({
          error:
            "This email was signed up without Google. Please log in with password.",
        });
      }
    } else {
      let username = await generateUsername(email);
      user = new User({
        personal_info: {
          fullname: name,
          email,
          profile_img: updatedPicture,
          username,
        },
        google_auth: true,
      });

      await user.save();
    }

    res.status(200).json(formatDatatoSend(user));
  } catch (err) {
    console.error("Google auth error:", err);
    res
      .status(500)
      .json({
        error:
          "Failed to authenticate you with Google. Try another Google account.",
        details: err.message,
      });
  }
});

server.listen(PORT, () => {
  console.log("Listening on port: " + PORT);
});
