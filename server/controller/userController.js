import User from "../Schema/User.js";
import bcrypt from "bcrypt";

// Validating email addresses and passwords
let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate password format
    if (
      !passwordRegex.test(currentPassword) ||
      !passwordRegex.test(newPassword)
    ) {
      return res.status(403).json({
        error:
          "Password should be 6 to 20 characters long with a numeric, 1 lowercase, and 1 uppercase letter",
      });
    }

    // Find user
    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if user logged in with Google
    if (user.google_auth) {
      return res.status(403).json({
        error:
          "You can't change account password because you logged in through Google",
      });
    }

    // Compare current password with hashed password
    const isMatch = await bcrypt.compare(
      currentPassword,
      user.personal_info.password
    );
    if (!isMatch) {
      return res.status(403).json({ error: "Incorrect Current Password" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in DB
    await User.findByIdAndUpdate(req.user, {
      "personal_info.password": hashedPassword,
    });

    return res.status(200).json({ status: "Password Changed" });
  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(500).json({
      error:
        "Some error occurred while changing the password. Please try again later.",
    });
  }
};

const searchUser = async (req, res) => {
  try {
    let { query } = req.body;

    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Invalid search query" });
    }

    query = query.trim();
    if (query.length === 0) {
      return res.status(400).json({ error: "Search query cannot be empty" });
    }

    const users = await User.find({
      "personal_info.username": new RegExp(query, "i"),
    })
      .limit(50)
      .select(
        "personal_info.fullname personal_info.username personal_info.profile_img -_id"
      );

    return res.status(200).json({ count: users.length, users });
  } catch (err) {
    console.error("Search user error:", err);
    return res
      .status(500)
      .json({ error: "Something went wrong. Please try again." });
  }
};

// const getProfile = async (req, res) => {
//   try {
//     const { username } = req.params; // Use URL params instead of body

//     if (!username) {
//       return res.status(400).json({ error: "Username is required" });
//     }

//     const user = await User.findOne({
//       "personal_info.username": username,
//     }).select("-personal_info.password -google_auth -updatedAt -blogs");

//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     return res.status(200).json(user);
//   } catch (err) {
//     console.error("Error fetching user profile:", err);
//     return res
//       .status(500)
//       .json({ error: "Something went wrong. Please try again." });
//   }
//   // res.send("Hello");
// };

const getProfile = async (req, res) => {
  try {
    const { username } = req.params; // Ensure route is set up correctly

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    const user = await User.findOne(
      { "personal_info.username": username },
      "-personal_info.password -google_auth -updatedAt -blogs"
    ); // More optimized projection

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(user);
  } catch (err) {
    console.error("Error fetching user profile:", err);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
  // res.send("hellp")
};


const updateProfile = async (req, res) => {
  try {
    const { username, social_links, bio } = req.body;
    const bioLimit = 150;

    if (!username || username.length < 3) {
      return res
        .status(400)
        .json({ error: "Username should be at least 3 letters long" });
    }

    if (bio && bio.length > bioLimit) {
      return res
        .status(400)
        .json({ error: `Bio should not be more than ${bioLimit} characters.` });
    }

    // Validate social links
    if (social_links && typeof social_links === "object") {
      for (let key of Object.keys(social_links)) {
        const url = social_links[key];
        if (url.length) {
          try {
            const hostName = new URL(url).hostname;
            if (!hostName.includes(`${key}.com`) && key !== "website") {
              return res.status(400).json({
                error: `${key} link is invalid. You must enter a full link.`,
              });
            }
          } catch (err) {
            return res.status(400).json({
              error: "You must provide full social links with http(s) included",
            });
          }
        }
      }
    }

    const updateObj = {
      "personal_info.username": username,
      "personal_info.bio": bio || "", // Ensure bio is always a string
      social_links: social_links || {}, // Ensure it's always an object
    };

    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user },
      updateObj,
      { runValidators: true, new: true } // Returns updated user
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    return res
      .status(200)
      .json({ username: updatedUser.personal_info.username });
  } catch (err) {
    console.error("Update Profile Error:", err);

    if (err.code === 11000) {
      return res.status(409).json({ error: "Username is already taken" });
    }

    return res.status(500).json({ error: "Something went wrong. Try again." });
  }
};

export { changePassword, searchUser, getProfile, updateProfile };
