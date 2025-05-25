const express = require("express");
const User = require("../models/user");
const G_User = require("../models/g_user");
const bcrypt = require("bcryptjs");
const authRouter = express.Router();
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");

//Create Account
authRouter.post("/api/signup", async (req, res) => {
  try {
    const { name, phonenumber, password, is_driver } = req.body;
    const existingUser = await User.findOne({ phonenumber });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let user = new User({
      name,
      phonenumber,
      password: hashedPassword,
      is_driver,
    });
    user = await user.save();
    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// Login
authRouter.post("/api/signin", async (req, res) => {
  try {
    const { phonenumber, password } = req.body;

    const user = await User.findOne({ phonenumber });
    if (!user) {
      return res
        .status(400)
        .json({ msg: "User with this phonenumber does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = jwt.sign({ _id: user._id }, "passwordKey");
    res.json({ token, ...user._doc });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

authRouter.post("/api/g_signin", async (req, res) => {
  try {
    const { id, name, email } = req.body;

    if (!id || !name || !email) {
      return res
        .status(400)
        .json({ error: "All fields (id, name, email) are required." });
    }

    let existingUser = await G_User.findOne({ email });
    if (existingUser) {
      return res.status(200).json({ message: "User already exists" });
    }

    let g_user = new G_User({
      id,
      name,
      email,
    });

    g_user = await g_user.save();
    res
      .status(201)
      .json({ message: "User successfully created", user: g_user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

module.exports = authRouter;
