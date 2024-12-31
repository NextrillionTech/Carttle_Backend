const express = require("express");
const axios = require("axios");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const Joi = require("joi");

// Import MongoDB models
const DrivingVerification = require("../models/drivingVerification");
const User = require("../models/user"); // Import User model

// Define validation schema
const schema = Joi.object({
  userId: Joi.string().required(),
  dlnumber: Joi.string().alphanum().min(5).max(20).required(),
  dob: Joi.string()
    .pattern(/^\d{2}-\d{2}-\d{4}$/)
    .required(), // Format: DD-MM-YYYY
});

router.post("/", async (req, res) => {
  // Validate input
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { userId, dlnumber, dob } = req.body;

  // Check if the driving license is already verified
  const existingDLRecord = await DrivingVerification.findOne({ dlnumber });
  if (existingDLRecord) {
    if (existingDLRecord.userId === userId) {
      // Same user trying to verify again
      return res.status(200).json({
        message: "Driving license already verified by this user.",
        data: existingDLRecord,
      });
    } else {
      // Different user attempting to verify an already verified DL
      return res.status(403).json({
        error: "This driving license is already verified and linked to another user.",
      });
    }
  }

  const options = {
    method: "POST",
    url: "https://driving-license-verification1.p.rapidapi.com/DL/DLDetails",
    headers: {
      "Content-Type": "application/json",
      "x-rapidapi-key": process.env.RAPIDAPI_KEY,
      "x-rapidapi-host": "driving-license-verification1.p.rapidapi.com",
    },
    data: {
      method: "dlvalidate",
      txn_id: uuidv4(),
      clientid: "2222",
      consent: "Y",
      dlnumber,
      dob,
    },
  };

  try {
    const response = await axios.request(options);
    const apiData = response.data?.Succeeded?.data?.result;

    if (!apiData) {
      return res.status(500).json({
        error: "Invalid API response or data not found in the response",
      });
    }

    const name = apiData.name;

    // Store verified DL information in the database
    await DrivingVerification.create({
      userId,
      dlnumber,
      name,
      dob,
    });

    // Update User record with the dlnumber and dob
    await User.findByIdAndUpdate(
      userId,
      { dlnumber, dob }, // Combine both dlnumber and dob into one object
      { new: true } // Return the updated document
    );


    return res.status(200).json({
      message: "Driving license verified and stored successfully!",
      data: apiData,
    });
  } catch (error) {
    console.error("Error verifying driving license:", error.message);
    return res.status(500).json({ error: "Failed to verify driving license." });
  }
});

module.exports = router;
