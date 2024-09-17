const express = require("express");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const authRouter = express.Router();
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");



//Create Account
authRouter.post("/api/signup", async (req, res) => {
  try {
    const { name, phonenumber, password } = req.body;
    const existingUser = await User.findOne({ phonenumber });
    if (existingUser) {
      return res
      .status(400)
      .json({ msg: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let user = new User({
      name,
      phonenumber,
      password: hashedPassword,
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
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ msg: "User with this email does not exist" });
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


module.exports = authRouter;
