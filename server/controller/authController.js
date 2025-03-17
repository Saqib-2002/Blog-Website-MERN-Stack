import User from "../Schema/User.js";

import bcrypt from "bcrypt";
import { generateUsername } from "../utils/generateUserName.js";
import { formatDatatoSend } from "../utils/formatDatatoSend.js";
import admin from "../firebase/firebase_config.js";
// Validating email addresses and passwords
let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

const signup = async (req, res) => {
  try {
    const { fullname, email, password } = req.body;
    // console.log(fullname, email, password);
    if (fullname.length < 3) {
      return res.status(400).json({
        error: "Fullname must be at least 3 letters long",
        field: "fullname",
      });
    }

    if (!email.length) {
      return res.status(400).json({ error: "Enter Email", field: "email" });
    }
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ error: "Email is invalid", field: "email" });
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error:
          "Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters",
        field: "password",
      });
    }
    console.log("User Model:", User);
    const existingUser = await User.findOne({ "personal_info.email": email });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Email already exists", field: "email" });
    }
    // console.log(existingUser);

    const hashed_password = await bcrypt.hash(password, 10);
    console.log(hashed_password);
    const username = await generateUsername(email);
    console.log(username);
    // console.log(username);

    const user = new User({
      personal_info: {
        fullname,
        email,
        password: hashed_password,
        username,
      },
    });

    await user.save();
    res.status(201).json(formatDatatoSend(user));
  } catch (err) {
    res.status(500).json({ error: "Internal app error", details: err.message });
  }
};

const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ "personal_info.email": email });
    if (!user) {
      return res.status(404).json({ error: "Email not found", field: "email" });
    }

    if (!user.google_auth) {
      const isPasswordValid = await bcrypt.compare(
        password,
        user.personal_info.password
      );
      if (!isPasswordValid) {
        return res
          .status(401)
          .json({ error: "Incorrect Password", field: "password" });
      }
      res.status(200).json(formatDatatoSend(user));
    } else {
      return res.status(403).json({
        error: "Account was created using google. Try logging in with google",
      });
    }
  } catch (err) {
    res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
};

const googleAuth = async (req, res) => {
  try {
    const { id_token } = req.body;

    if (!id_token) {
      return res.status(400).json({ error: "No ID token provided" });
    }

    let decodedUser;
    try {
      decodedUser = await admin.auth().verifyIdToken(id_token);
    } catch (verifyError) {
      console.error("Token verification error:", verifyError);
      return res
        .status(401)
        .json({ error: "Invalid token", details: verifyError.message });
    }
    // console.log("Decoded User: ", decodedUser);
    const { email, name, picture } = decodedUser;
    let updatedPicture = picture.replace("s96-c", "s384-c");

    let user = await User.findOne({ "personal_info.email": email }).select(
      "personal_info.fullname personal_info.username personal_info.profile_img google_auth"
    );

    if (!user) {
      let username = email.split("@")[0]; // Generate username from email
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
      .json({ error: "Failed to authenticate", details: err.message });
  }
};
export { signup, signin, googleAuth };
