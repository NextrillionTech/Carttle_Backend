// routes/rcVerification.js

const express = require('express');
const https = require('https');
const router = express.Router();
const VehicleVerification = require('../models/vehicleVerification');
const User = require("../models/user");


router.post('/', async (req, res) => {
  const { userId, reg_no } = req.body;

  // Input validation
  if (!userId || !reg_no) {
    return res.status(400).json({ error: 'User ID and RC Number are required.' });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const data = JSON.stringify({
    reg_no: reg_no,
    consent: "Y",
    consent_text: "I hear by declare my consent agreement for fetching my information via AITAN Labs API"
  });

  const options = {
    method: 'POST',
    hostname: 'rto-vehicle-information-verification-india.p.rapidapi.com', 
    port: null,
    path: '/api/v1/rc/vehicleinfo', 
    headers: {
      'x-rapidapi-key': process.env.RAPIDAPI_KEY,
      'x-rapidapi-host': 'rto-vehicle-information-verification-india.p.rapidapi.com', 
      'Content-Type': 'application/json',
    },
  };

  const apiReq = https.request(options, (apiRes) => {
    let chunks = [];

    apiRes.on('data', (chunk) => {
      chunks.push(chunk);
    });

    apiRes.on('end', async () => {
      const body = Buffer.concat(chunks).toString();
      try {
        const parsedData = JSON.parse(body);

        const { owner_name, vehicle_class_desc, model, state, current_full_address } = parsedData.result;

        await VehicleVerification.create({
          userId: userId,
          reg_no: reg_no,
          owner_name: owner_name,
          vehicle_class_desc: vehicle_class_desc,
          model: model,
          state: state,
          current_full_address: current_full_address
        });

        res.status(apiRes.statusCode).json(parsedData);
      } catch (e) {
        console.error('Error parsing API response:', e);
        res.status(500).json({ error: 'Invalid response from verification service.' });
      }
    });
  });

  apiReq.on('error', (error) => {
    console.error('Error with the request:', error);
    res.status(500).json({ error: 'Failed to verify vehicle registration certificate. Please try again later.' });
  });

  apiReq.write(data);
  apiReq.end();
});

module.exports = router;
