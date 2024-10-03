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
        data: existingRecord
      });
    } else {
      // If the registration number is linked to another user
      return res.status(403).json({
        error: "This registration number is already verified and linked to another user."
      });
    }
  }

  // Prepare the data for API request
  const data = JSON.stringify({
    reg_no: regNumber,
    consent: "Y",
    consent_text:
      "I hereby declare my consent for fetching my information via AITAN Labs API",
  });

  const options = {
    method: "POST",
    hostname: "rto-vehicle-information-verification-india.p.rapidapi.com",
    port: null,
    path: "/api/v1/rc/vehicleinfo",
    headers: {
      "x-rapidapi-key": process.env.RAPIDAPI_KEY,
      "x-rapidapi-host":
        "rto-vehicle-information-verification-india.p.rapidapi.com",
      "Content-Type": "application/json",
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

        // Extract relevant fields from the API response
        const {
          owner_name,
          vehicle_class_desc,
          model,
          state,
          current_full_address,
        } = parsedData.result;

        // Store the verified data in the database
        const newVerification = await VehicleVerification.create({
          userId,
          reg_no: regNumber,
          owner_name,
          vehicle_class_desc,
          model,
          state,
          current_full_address,
        });

        // Respond with the API data
        res.status(apiRes.statusCode).json({
          message: "Vehicle verified and stored successfully!",
          data: newVerification
        });
      } catch (e) {
        console.error("Error parsing API response:", e);
        res
          .status(500)
          .json({ error: "Invalid response from verification service." });
      }
    });
  });

  // Handle errors from the API request
  apiReq.on("error", (error) => {
    console.error("Request error:", error);
    res.status(500).json({ error: "Failed to verify vehicle registration." });
  });

  // Send the request data
  apiReq.write(data);
  apiReq.end();
});

module.exports = rcRouter;
