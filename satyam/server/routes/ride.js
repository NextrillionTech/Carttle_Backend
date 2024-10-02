const express = require("express");
const router = express.Router();
const bodyParser = require('body-parser');
const Ride = require('../models/ride'); // Assuming the model is in the 'models' folde

// POST request for creating a new ride
router.post('/', async (req, res) => {
  try {
    const { userId, from, to, available_seat, amount_per_seat, shuttle, dateDetails } = req.body;

    // Create a new ride document based on the input
    const newRide = new Ride({
      userId,
      from: {
        latitude: from.latitude,
        longitude: from.longitude
      },
      to: {
        latitude: to.latitude,
        longitude: to.longitude
      },
      available_seat,
      amount_per_seat,
      shuttle,
      dateDetails: shuttle 
        ? { start_date: dateDetails.start_date, end_date: dateDetails.end_date, time: dateDetails.time }
        : { date: dateDetails.date, time: dateDetails.time }
    });

    // Save the ride to the database
    await newRide.save();
    res.status(201).json({ message: 'Ride created successfully!', ride: newRide });
  } catch (err) {
    console.error('Error creating ride:', err);
    res.status(500).json({ error: 'Failed to create the ride' });
  }
});

module.exports = router;
