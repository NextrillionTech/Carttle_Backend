const express = require("express");
const https = require("https");
const rcRouter = express.Router();
const VehicleVerification = require("../models/vehicleVerification");
const User = require("../models/user");

rcRouter.post("/verify-rc", async (req, res) => {
  const { userId, regNumber } = req.body;

  // Validate input
  if (!userId || !regNumber) {
    return res
      .status(400)
      .json({ error: "User ID and registration number are required." });
  }

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  // Check if the registration number already exists in the database
  const existingRecord = await VehicleVerification.findOne({ reg_no: regNumber });
  if (existingRecord) {
    // If the registration number exists, check if it's associated with the same user
    if (existingRecord.userId.toString() === userId) {
      return res.status(200).json({
        message: "Vehicle is already verified by this user.",
        data: existingRecord,
      });
    } else {
      // If the registration number is linked to another user
      return res.status(403).json({
        error: "This registration number is already verified and linked to another user.",
      });
    }
  }

  // Prepare the options for API request to the new host
  const options = {
    method: "GET",
    hostname: "rc-verification-india.p.rapidapi.com",
    port: null,
    path: `/${regNumber}`, // Assuming the registration number is passed in the path
    headers: {
      "x-rapidapi-key": process.env.RAPIDAPI_KEY, // Ensure your API key is securely stored in environment variables
      "x-rapidapi-host": "rc-verification-india.p.rapidapi.com",
    },
  };

  // API request to third-party service
  const apiReq = https.request(options, (apiRes) => {
    let chunks = [];

    apiRes.on("data", (chunk) => {
      chunks.push(chunk);
    });

    apiRes.on("end", async () => {
      const body = Buffer.concat(chunks).toString();
      try {
        const parsedData = JSON.parse(body);

        // Extract required fields from the API response
        const { color, registrationNumber, rc_model } = parsedData.detail;

        // Store the verified data in the database
        const newVerification = await VehicleVerification.create({
          userId,
          reg_no: registrationNumber,
          color,
          rc_model,
        });

        // Update User record with the regNumber
        await User.findByIdAndUpdate(
          userId,
          { regNumber },
          { new: true } // Return the updated document
        );

        // Respond with the API data
        res.status(apiRes.statusCode).json({
          message: "Vehicle verified and stored successfully!",
          data: newVerification,
        });
      } catch (e) {
        console.error("Error parsing API response:", e);
        res.status(500).json({ error: "Invalid response from verification service." });
      }
    });
  });

  // Handle errors from the API request
  apiReq.on("error", (error) => {
    console.error("Request error:", error);
    res.status(500).json({ error: "Failed to verify vehicle registration." });
  });

  // Send the request
  apiReq.end();
});


module.exports = rcRouter;
