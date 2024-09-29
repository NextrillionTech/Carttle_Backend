// routes/dlVerification.js

const express = require('express');
const axios = require('axios');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');

// Import the MongoDB model
const drivingVerification = require('../models/drivingVerification');  

// Define validation schema
const schema = Joi.object({
  userId: Joi.string().required(), 
  dlnumber: Joi.string().alphanum().min(5).max(20).required(),
  dob: Joi.string().pattern(/^\d{2}-\d{2}-\d{4}$/).required(), // Format: DD-MM-YYYY
});


router.post('/', async (req, res) => {
  // Validate input
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { userId, dlnumber, dob } = req.body;

  const options = {
    method: 'POST',
    url: 'https://driving-license-verification1.p.rapidapi.com/DL/DLDetails',
    headers: {
      'Content-Type': 'application/json',
      'x-rapidapi-key': process.env.RAPIDAPI_KEY,
      'x-rapidapi-host': 'driving-license-verification1.p.rapidapi.com',
    },
    data: {
      method: 'dlvalidate',
      txn_id: uuidv4(), // Dynamically generated transaction ID
      clientid: '2222',
      consent: 'Y',
      dlnumber: dlnumber,
      dob: dob,
    },
  };

  try {
    const response = await axios.request(options);

    const apiData = response.data?.Succeeded?.data?.result;
    
    if (!apiData) {
      return res.status(500).json({ error: 'Invalid API response or data not found in the response' });
    }

    // Accessing the first entry if it exists
    const name = apiData.name;


    // Save to database if name is available
    await drivingVerification.create({
      userId: userId,
      dlnumber: dlnumber,
      name: name, 
      dob: dob,
    });

    return res.status(200).json(apiData);
} catch (error) {
    console.error('Error verifying driving license:', error.response ? error.response.data : error.message);
    return res.status(500).json({ error: 'Failed to verify driving license. Please try again later.' });
}

});


module.exports = router;
