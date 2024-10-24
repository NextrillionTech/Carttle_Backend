const express = require("express");
const User = require("../models/user");
const G_User = require("../models/g_user");
const bcrypt = require("bcryptjs");
const profileRouter = express.Router();
const jwt = require("jsonwebtoken");

profileRouter.get("/user-info/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // Fetch the user information by userId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Construct the response data with user and vehicle info
    const userInfo = {
      name: user.name,
      dob: user.dob,
      dl_number: user.dlnumber,
      reg_number: user.regNumber,
      phone_number: user.phonenumber,
      email:user.email,
      gender:user.gender,
      about_yourself:user.about_yourself,
      drive_speed:user.drive_speed,
      music_taste:user.music_taste,
    };

    // Return the user information
    return res.status(200).json({
      message: "User information fetched successfully.",
      data: userInfo,
    });
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ error: "Server error. Could not fetch user info." });
  }
});

profileRouter.post("/update-user", async (req, res) => {
  try {
    const { userId, email, gender, about_yourself, drive_speed, music_taste } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Update the user with new data
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { email, gender, about_yourself, drive_speed, music_taste },
      { new: true } // Return the updated document
    );

    return res.status(200).json({
      message: "User updated successfully.",
      data: updatedUser,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

profileRouter.post("/change-password", async (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;

  try {
    // Fetch the user by userId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Check if the old password matches the stored (hashed) password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Old password is incorrect." });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password with the new hashed password
    user.password = hashedPassword;
    await user.save();

    // Return success message
    return res.status(200).json({
      message: "Password updated successfully.",
    });
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({ error: "Server error. Could not change password." });
  }
});


module.exports = profileRouter;
