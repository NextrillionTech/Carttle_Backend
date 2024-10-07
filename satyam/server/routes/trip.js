const express = require("express");
const router = express.Router();
const Trip = require("../models/trip");
const Ride = require("../models/ride");
const User = require("../models/user");

router.post("/create-trip", async (req, res) => {
  try {
    const {
      rideId,
      driver,
      travellers,
      from,
      to,
      earning,
      review,
      date,
      tripStartTime,
      tripEndTime,
      rating,
      totalSeatsAvailable
    } = req.body;

    // Check if a trip with the same rideId already exists
    const existingTrip = await Trip.findOne({ rideId });
    if (existingTrip) {
      return res.status(409).json({ error: "Trip with this rideId already exists." });
    }

    // Validate if ride exists
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ error: "Ride not found" });
    }

    // Validate if driver exists
    const driver_1 = await User.findById(driver.userId);
    if (!driver_1) {
      return res.status(404).json({ error: "Driver not found" });
    }

    // Validate if traveller user IDs exist
    for (const traveller of travellers) {
      const travellerUser = await User.findById(traveller.userId);
      if (!travellerUser) {
        return res.status(404).json({ error: `Traveller ${traveller.name} not found` });
      }
    }

    // Create the trip
    const trip = new Trip({
      rideId,
      driver: {
        name: driver.name,
        userId: driver.userId,
      },
      travellers,
      from,
      to,
      earning,
      review,
      date,
      tripStartTime,
      tripEndTime: tripEndTime || null, // Can be null till trip completes
      rating,
      totalSeatsAvailable,
    });

    await trip.save();
    return res.status(201).json({ message: "Trip created successfully!", trip });
  } catch (error) {
    console.error("Error creating trip:", error);
    return res.status(500).json({ error: "Failed to create trip" });
  }
});

// GET all trips for a specific driver
router.get("/driver-trips/", async (req, res) => {
  try {
    // Fetch all trips from the Trip collection
    const trips = await Trip.find();

    if (trips.length === 0) {
      return res.status(404).json({ message: "No trips found." });
    }

    return res.status(200).json({ message: "All trips retrieved successfully", trips });
  } catch (error) {
    console.error("Error fetching all trips:", error.message);
    return res.status(500).json({ error: "Failed to retrieve trips." });
  }
});

module.exports = router;
