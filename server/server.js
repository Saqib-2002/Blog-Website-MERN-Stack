// Importing necessary libraries
import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt"; // library for hashing and comparing passwords in a secure manner
import { nanoid } from "nanoid"; // This function generates unique, random, and URL-friendly IDs in JavaScript.
import jwt from "jsonwebtoken"; // JWTs are typically used for authentication and authorization in web applications.
import cors from "cors"; // CORS is a mechanism that allows resources (like APIs) on a web server to be requested from another domain outside the domain from which the resource originated.
import dotenv from "dotenv";
import admin from "firebase-admin";
// import serviceAccountKey from "./blog-website-mern-stack-firebase-adminsdk-sb874-bbd8664920.json" assert { type: "json" };
import { getAuth } from "firebase-admin/auth";
import fs from "fs";
import path, { resolve } from "path";
import { fileURLToPath } from "url";
import multer from "multer";
dotenv.config();

// For GDrive Upload
import { GoogleAuth } from "google-auth-library";
import { google } from "googleapis";

// Schema import
import User from "./Schema/User.js";
import Blog from "./Schema/Blog.js";
<<<<<<< HEAD
import { type } from "os";
=======
import Notification from "./Schema/Notification.js";
import Comment from "./Schema/Comment.js";

import { type } from "os";
import e from "express";
>>>>>>> 1a95937f8550051d24fcc941a6513d887a7943bc

// Initializing server
const server = express(); // initializing a new Express application instance
let PORT = 3000; // specifying the port on which the server will listen for incoming connections.

// Getting the path of the server.js file directory.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// console.log("DIR name = ", __dirname);

// Complete Path of firebase admin file
const serviceAccountKeyPath = path.join(
  __dirname,
  "blog-website-mern-stack-firebase-adminsdk-sb874-bbd8664920.json"
);
// console.log("Service account key path:", serviceAccountKeyPath); // Log the path

// Reading all the data from firebase admin file
const serviceAccountKey = JSON.parse(
  fs.readFileSync(serviceAccountKeyPath, "utf8")
);
// console.log("Service Account Key", serviceAccountKey);

// initialization of Firebase Admin SDK in a Node.js environment.
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
});

// Validating email addresses and passwords
let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

// implementation of middleware in an Express.js server application.
server.use((req, res, next) => {
  console.log(`Received ${req.method} request to ${req.url}`);
  next();
});

// it allows your server to automatically parse JSON data sent in the request body.
server.use(express.json());

// CORS - Cross-Origin Resource Sharing
server.use(
  cors({
    origin: "http://localhost:5173", // replace with your frontend URL
    credentials: true,
  })
);

// Improved MongoDB connection with error logging - Connecting to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, { autoIndex: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit the process if unable to connect to the database
  });

// Verifying JWT Token
const verifyJWT = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  // console.log(authHeader);
  const token = authHeader && authHeader.split(" ")[1];
  // console.log(token);

  if (token == null) {
    return res.status(401).json({ error: "No access token" });
  }
  jwt.verify(token, process.env.SECRET_ACCESS_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Access token is invalid" });
    }

    req.user = user.id;
    next();
  });
};

// Formatting Data
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

// Generating random userName
const generateUsername = async (email) => {
  let username = email.split("@")[0];
  let isUsernameExists = await User.exists({
    "personal_info.username": username,
  }).then((result) => result);

  isUsernameExists ? (username += nanoid().substring(0, 3)) : "";
  return username;
};

// Sign Up.
server.post("/signup", async (req, res) => {
  try {
    const { fullname, email, password } = req.body;
    // console.log("Received signup request:", {
    //   fullname,
    //   email,
    //   password: "******",
    // });

    if (fullname.length < 3) {
      // console.log("Fullname validation failed");
      return res.status(400).json({
        error: "Fullname must be at least 3 letters long",
        field: "fullname",
      });
    }

    if (!email.length) {
      // console.log("Email empty");
      return res.status(400).json({ error: "Enter Email", field: "email" });
    }
    if (!emailRegex.test(email)) {
      // console.log("Email validation failed");
      return res
        .status(400)
        .json({ error: "Email is invalid", field: "email" });
    }

    if (!passwordRegex.test(password)) {
      // console.log("Password validation failed");
      return res.status(400).json({
        error:
          "Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters",
        field: "password",
      });
    }

    const existingUser = await User.findOne({ "personal_info.email": email });
    if (existingUser) {
      // console.log("Email already exists");
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
    // console.log("User saved successfully");
    res.status(201).json(formatDatatoSend(user));
  } catch (err) {
    // console.error("Signup error:", err);
    res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
});

// Sign In
server.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    // console.log("Received signin request:", { email, password: "******" });

    const user = await User.findOne({ "personal_info.email": email });
    if (!user) {
      // console.log("Email not found");
      return res.status(404).json({ error: "Email not found", field: "email" });
    }

    if (!user.google_auth) {
      const isPasswordValid = await bcrypt.compare(
        password,
        user.personal_info.password
      );
      if (!isPasswordValid) {
        // console.log("Incorrect password");
        return res
          .status(401)
          .json({ error: "Incorrect Password", field: "password" });
      }
      // console.log("Signin successful");
      res.status(200).json(formatDatatoSend(user));
    } else {
      return res.status(403).json({
        error: "Account was created using google. Try logging in with google",
      });
    }
  } catch (err) {
    // console.error("Signin error:", err);
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

// Google Authentication
server.post("/google-auth", async (req, res) => {
  try {
    // console.log("Google Auth request body: ", req.body);
    const { id_token } = req.body;
    // console.log("ID Token = ", id_token);

    if (!id_token) {
      return res.status(400).json({ error: "No id token provided" });
    }
    let decodedUser;
    try {
      // Verify the token with Firebase Admin SDK
      decodedUser = await getAuth().verifyIdToken(id_token);
      // console.log("DECODED_TOKEN_ID_TOKEN:- ", decodedUser);
      // console.log("Decoded user: ", JSON.stringify(decodedUser));
    } catch (verifyError) {
      console.error("Token verification error:", verifyError);
      return res.status(401).json({
        error: "Invalid token",
        details: verifyError.message,
      });
    }

    const { email, name, picture } = decodedUser;
    // console.log(`Name = ${name}, email = ${email}, picture = ${picture}`);

    let updatedPicture = picture.replace("s96-c", "s384-c");

    let user = await User.findOne({ "personal_info.email": email }).select(
      "personal_info.fullname personal_info.username personal_info.profile_img google_auth"
    );
    // console.log(`Personal Full name = ${personal_info.fullname}`);

    if (user) {
      // login
      // console.log("User Info", user.personal_info)
      // if (!user.personal_info.google_auth) {
      //   console.log(user.personal_info.google_auth);
      //   return res.status(403).json({
      //     error:
      //       "This email was signed up without Google. Please log in with password to access the account.",
      //   });
      // }
    } else {
      // signup
      // Create a new user with the profile image
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
      // saving user data
      await user
        .save()
        .then((u) => {
          user = u;
        })
        .catch((err) => {
          return res.status(500).json({ error: err.message });
        });
    }

    res.status(200).json(formatDatatoSend(user));
  } catch (err) {
    console.error("Google auth error:", err);
    res.status(500).json({
      error:
        "Failed to authenticate you with Google. Try another Google account.",
      details: err.message,
    });
  }
});

// Change Password
server.post("/change-password", verifyJWT, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  console.log(currentPassword);

  if (
    !passwordRegex.test(currentPassword) ||
    !passwordRegex.test(newPassword)
  ) {
    //   console.log("error");
    return res.status(403).json({
      error:
        "Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters",
    });
  }

  User.findOne({ _id: req.user })
    .then((user) => {
      if (user.google_auth) {
        return res.status(403).json({
          errror:
            "You can't change account password because you logged in through google",
        });
      }

      bcrypt.compare(
        currentPassword,
        user.personal_info.password,
        (err, result) => {
          console.log(result);
          if (err) {
            return res.status(500).json({
              error:
                "Some error occured while changing the password. Please try again later",
            });
          }
          // console.log(result);
          // console.log(user.personal_info.password);

          if (!result) {
            // console.log(result);
            return res
              .status(403)
              .json({ error: "Incorrect Current Password" });
          }

          bcrypt.hash(newPassword, 10, (err, hashed_password) => {
            User.findOneAndUpdate(
              { _id: req.user },
              { "personal_info.password": hashed_password }
            )
              .then((u) => {
                return res.status(200).json({ status: "Password Changed" });
              })
              .catch((err) => {
                return res.status(500).json({
                  error: "Some error occured while saving new password",
                });
              });
          });
        }
      );
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ error: "User not found" });
    });
});

// getting the directory path
const uploadsDir = "./uploads/images";
// console.log(uploadsDir);

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `banner_${Date.now()}${path.extname(file.originalname)}`);
  },
});
// console.log("Multer Storage - ", storage);

// Uploading in the file
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
    }
  },
});

// Enable CORS (for development)
server.use(cors());

// Serve uploaded files
server.use("/images", express.static("uploads/images"));

// Banner upload route
server.post("/upload", upload.single("banner"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded",
    });
  }

  res.json({
    success: true,
    image_url: `http://localhost:${PORT}/images/${req.file.filename}`,
  });
});

// Latest Blogs
server.post("/latest-blogs", (req, res) => {
  let { page } = req.body;
  console.log("Page - ", page);
  const maxLimit = 5;

  Blog.find({ draft: false })
    .populate(
      "author",
      "personal_info.profile_img personal_info.username personal_info.fullname -_id"
    )
    .sort({ publishedAt: -1 })
    .select("blog_id title des banner activity tags publishedAt -_id")
    .limit(maxLimit)
    .skip((page - 1) * maxLimit)
    .then((blogs) => {
      return res.status(200).json({ blogs });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

<<<<<<< HEAD
=======
// filter Pagination data
server.post("/all-latest-blogs-count", (req, res) => {
  Blog.countDocuments({ draft: false })
    .then((count) => {
      return res.status(200).json({ totalDocs: count });
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ error: err.message });
    });
});

>>>>>>> 1a95937f8550051d24fcc941a6513d887a7943bc
// Trending Blogs
server.get("/trending-blogs", (req, res) => {
  Blog.find({ draft: false })
    .populate(
      "author",
      "personal_info.profile_img personal_info.username personal_info.fullname -_id"
    )
    .sort({
      "activity.total_read": -1,
      "activity.total_likes": -1,
      publishedAt: -1,
    })
    .select("blog_id title publishedAt -_id")
    .limit(5)
    .then((blogs) => {
      return res.status(200).json({ blogs });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

// Filtering Blog Data
server.post("/search-blogs", (req, res) => {
  // console.log("Request body - ", req.body);

<<<<<<< HEAD
  const { tag } = req.body;
=======
  const { tag, page, query, author, limit, eliminate_blog } = req.body;
>>>>>>> 1a95937f8550051d24fcc941a6513d887a7943bc

  // console.log(typeof tag);
  // console.log("Search body - ", String(tag));

<<<<<<< HEAD
  const findQuery = {
    tags: tag,
    draft: false,
  };

  const maxLimit = 5;
=======
  let findQuery;

  if (tag) {
    findQuery = {
      tags: tag,
      draft: false,
      blog_id: { $ne: eliminate_blog },
    };
  } else if (query) {
    findQuery = { draft: false, title: new RegExp(query, "i") };
  } else if (author) {
    findQuery = { author, draft: false };
  }
  const maxLimit = limit ? limit : 2;
>>>>>>> 1a95937f8550051d24fcc941a6513d887a7943bc

  Blog.find(findQuery)
    .populate(
      "author",
      "personal_info.profile_img personal_info.username personal_info.fullname -_id"
    )
    .sort({ publishedAt: -1 })
    .select("blog_id title des banner activity tags publishedAt -_id")
<<<<<<< HEAD
=======
    .skip((page - 1) * maxLimit)
>>>>>>> 1a95937f8550051d24fcc941a6513d887a7943bc
    .limit(maxLimit)
    .then((blogs) => {
      return res.status(200).json({ blogs });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

<<<<<<< HEAD
=======
server.post("/search-blogs-count", (req, res) => {
  let { tag, query, author } = req.body;
  let findQuery;
  if (tag) {
    findQuery = {
      tags: tag,
      draft: false,
    };
  } else if (query) {
    findQuery = { draft: false, title: new RegExp(query, "i") };
  } else if (author) {
    findQuery = { author, draft: false };
  }

  Blog.countDocuments(findQuery)
    .then((count) => {
      return res.status(200).json({ totalDocs: count });
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ error: err.message });
    });
});

// Searching Users
server.post("/search-users", (req, res) => {
  let { query } = req.body;
  console.log(query);
  User.find({
    "personal_info.username": new RegExp(query, "i"),
  })
    .limit(50)
    .select(
      "personal_info.fullname personal_info.username personal_info.profile_img -_id"
    )
    .then((users) => {
      return res.status(200).json({ users });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

// profile page
server.post("/get-profile", (req, res) => {
  let { username } = req.body;
  User.findOne({ "personal_info.username": username })
    .select("-personal_info.password -google_auth -updatedAt -blogs")
    .then((user) => {
      return res.status(200).json(user);
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ error: err.message });
    });
});

// update profile
server.post("/update-profile", verifyJWT, (req, res) => {
  const { username, social_links, bio } = req.body;
  const bioLimit = 150;
  if (username.length < 3) {
    return res
      .status(403)
      .json({ error: "Username should be atleast 3 letters long" });
  }
  if (bio.length > bioLimit) {
    return res
      .status(403)
      .json({ error: `Bio should not be more than ${bioLimit} characters.` });
  }

  const socialLinksArr = Object.keys(social_links);
  try {
    for (const i = 0; i < socialLinksArr.length; i++) {
      if (social_links[socialLinksArr[i]].length) {
        const hostName = new URL(social_links[socialLinksArr[i]]).hostname;

        if (
          !hostName.includes(`${socialLinksArr[i]}.com`) &&
          socialLinksArr[i] != "website"
        ) {
          return res.status(403).json({
            error: `${socialLinksArr[i]} link is invalid. You must enter a full link`,
          });
        }
      }
    }
  } catch (err) {
    return res.status(500).json({
      error: "You must provide full social links with http(s) included",
    });
  }

  const updateObj = {
    "personal_info.username": username,
    "personal_info.bio": bio,
    social_links,
  };

  User.findOneAndUpdate({ _id: req.user }, updateObj, {
    runValidators: true,
  })
    .then(() => {
      return res.status(200).json({ username });
    })
    .catch((err) => {
      if (err.code == 11000) {
        return res.status(409).json({ error: "Username is already taken" });
      }

      return res.status(500).json({ error: err.message });
    });
});

>>>>>>> 1a95937f8550051d24fcc941a6513d887a7943bc
// Create Blog Route
server.post("/create-blog", verifyJWT, (req, res) => {
  // console.log("Request body:", req.body);
  console.log("Received blog data:", req.body);
  const authorId = req.user;
  console.log("Author ID = ", authorId);

  let { title, des, banner, tags, content, draft, id } = req.body;
  console.log(tags);

  if (!title.length) {
    return res
      .status(403)
      .json({ error: "You must provide a title to publish the blog" });
  }
  if (!draft) {
    if (!title || !des || !banner || !tags || !content) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    if (!des.length || des.length > 200) {
      return res.status(403).json({
        error: "You must provide blog description under 200 characters",
      });
    }

    if (!banner.length) {
      return res
        .status(403)
        .json({ error: "You must provide blog banner to publish it" });
    }

    if (!content.blocks.length) {
      return res
        .status(403)
        .json({ error: "There must be some blog content to publish it" });
    }

    if (!tags.length || tags.length > 10) {
      return res.status(403).json({
        error: "Provide tags in order to publish the blog. Maximum 10",
      });
    }
  }

  // Storing data in database
  tags = tags.map((tag) => tag.toLowerCase());
  const blog_id =
    id ||
    title
      .replace(/[^a-zA-Z0-9]/g, " ")
      .replace(/\s+/g, "-")
      .trim() + nanoid();
  console.log("Blog ID", blog_id);

  if (id) {
    Blog.findOneAndUpdate(
      { blog_id },
      { title, des, banner, content, tags, draft: draft ? draft : false }
    )
      .then(() => {
        return res.status(200).json({ id: blog_id });
      })
      .catch((err) => {
        return res.status(500).json({ error: err.message });
      });
  } else {
    // Storing data inside the mongoDB
    const blog = new Blog({
      title,
      des,
      banner,
      content,
      tags,
      author: authorId,
      blog_id,
      draft: Boolean(draft),
    });

    blog
      .save()
      .then((blog) => {
        const incrementVal = draft ? 0 : 1;

        User.findOneAndUpdate(
          { _id: authorId },
          {
            $inc: { "account_info.total_posts": incrementVal },
            $push: { blogs: blog._id },
          }
        )
          .then((user) => {
            return res.status(200).json({ id: blog.blog_id });
          })
          .catch((err) => {
            return res
              .status(500)
              .json({ error: "Failed to update total posts number." });
          });
      })
      .catch((err) => {
        return res.status(500).json({ error: err.message });
      });
  }
});

server.post("/get-blog", (req, res) => {
  const { blog_id, draft, mode } = req.body;
  let incrementVal = mode != "edit" ? 1 : 0;

  Blog.findOneAndUpdate(
    { blog_id },
    { $inc: { "activity.total_reads": incrementVal } }
  )
    .populate(
      "author",
      "personal_info.fullname personal_info.username personal_info.profile_img"
    )
    .select("title des content banner activity publishedAt blog_id tags")
    .then((blog) => {
      User.findOneAndUpdate(
        { "personal_info.username": blog.author.personal_info.username },
        { $inc: { "account_info.total_reads": incrementVal } }
      ).catch((err) => {
        return res.status(500).json({ error: err.message });
      });

      if (blog.draft && !draft) {
        return res.status(500).json({ error: "You cannot access draft blog." });
      }
      return res.status(200).json({ blog });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

server.post("/like-blog", verifyJWT, (req, res) => {
  const user_id = req.user;
  const { _id, isLikedByUser } = req.body;

  const incrementVal = !isLikedByUser ? 1 : -1;

  Blog.findOneAndUpdate(
    { _id },
    { $inc: { "activity.total_likes": incrementVal } }
  ).then((blog) => {
    if (!isLikedByUser) {
      const like = new Notification({
        type: "like",
        blog: _id,
        notification_for: blog.author,
        user: user_id,
      });
      like.save().then((notification) => {
        return res.status(200).json({ liked_by_user: true });
      });
    } else {
      Notification.findOneAndDelete({ user: user_id, blog: _id, type: "like" })
        .then((data) => {
          return res.status(200).json({ liked_by_user: false });
        })
        .catch((err) => {
          return res.status(500).json({ error: err.message });
        });
    }
  });
});

server.post("/isliked-by-user", verifyJWT, (req, res) => {
  const user_id = req.user;
  const { _id } = req.body;

  Notification.exists({ user: user_id, type: "like", blog: _id })
    .then((result) => {
      console.log(result);
      return res.status(200).json({ result });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

server.post("/add-comment", verifyJWT, (req, res) => {
  const user_id = req.user;
  const { _id, comment, blog_author } = req.body;

  if (!comment.length) {
    return res
      .status(403)
      .json({ error: "Write something to leave a comment" });
  }
  // creating a comment doc.
  let commentObj = new Comment({
    blog_id: _id,
    blog_author,
    comment,
    commented_by: user_id,
  });
  commentObj.save().then((commentFile) => {
    const { comment, commentedAt, children, commented_by } = commentFile;
    Blog.findOneAndUpdate(
      { _id },
      {
        $push: { comments: commentFile._id },
        $inc: { "activity.total_comments": 1 },
        "activity.total_parent_comments": 1,
      }
    ).then((blog) => {
      console.log("New comment created");
    });

    const notificationObj = {
      type: "comment",
      blog: _id,
      notification_for: blog_author,
      user: user_id,
      comment: commentFile._id,
    };

    new Notification(notificationObj)
      .save()
      .then((notification) => console.log("New notification added"));

    return res.status(200).json({
      comment,
      commentedAt,
      _id: commentFile._id,
      user_id,
      children,
      commented_by,
    });
  });
});

server.post("/get-blog-comments", (req, res) => {
  const { blog_id, skip } = req.body;
  const maxLimit = 5;

  Comment.find({ blog_id, isReply: false })
    .populate(
      "commented_by",
      "personal_info.username personal_info.fullname personal_info.profile_img"
    )
    .skip(skip)
    .limit(maxLimit)
    .sort({ commentedAt: -1 })
    .then((comment) => {
      return res.status(200).json(comment);
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ errror: err.message });
    });
});

// Listening to Port
server.listen(PORT, () => {
  console.log("Listening on port: " + PORT);
});
