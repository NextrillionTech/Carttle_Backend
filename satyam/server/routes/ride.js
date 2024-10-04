const express = require("express");
const rideRouter = express.Router();
const Ride = require("../models/ride");

// Helper function to generate all dates between start and end
const getDatesBetween = (startDate, endDate) => {
  const dates = [];
  let currentDate = new Date(startDate);
  const lastDate = new Date(endDate);

  while (currentDate <= lastDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

// POST request for creating a new ride
rideRouter.post("/create-ride", async (req, res) => {
  console.log("Received data:", req.body);
  try {
    const {
      userId,
      from,
      to,
      available_seat,
      amount_per_seat,
      shuttle,
      dateDetails,
    } = req.body;

    if (shuttle) {
      // Create separate entries for each day when shuttle is true
      const dates = getDatesBetween(
        dateDetails.start_date,
        dateDetails.end_date
      );

      for (let date of dates) {
        // Check if the ride exists on the same date and time for the user
        const existingRide = await Ride.findOne({
          userId,
          "dateDetails.date": date,
          "dateDetails.time": dateDetails.time,
        });

        if (existingRide) {
          return res.status(400).json({
            error: "You already have a ride scheduled at this date and time.",
          });
        }
      }

      const rideEntries = dates.map((date) => ({
        userId,
        from,
        to,
        available_seat,
        amount_per_seat,
        shuttle: true,
        dateDetails: { date, time: dateDetails.time },
      }));

      // Save all shuttle ride entries
      await Ride.insertMany(rideEntries);

      res.status(201).json({
        message: "Shuttle ride created for all days successfully!",
        rides: rideEntries,
      });
    } else {
      // Check if the ride exists on the same date and time for the user
      const existingRide = await Ride.findOne({
        userId,
        "dateDetails.date": dateDetails.date,
        "dateDetails.time": dateDetails.time,
      });

      if (existingRide) {
        return res.status(400).json({
          error: "You already have a ride scheduled at this date and time.",
        });
      }

      // Create a single entry for non-shuttle ride
      const newRide = new Ride({
        userId,
        from,
        to,
        available_seat,
        amount_per_seat,
        shuttle: false,
        dateDetails: { date: dateDetails.date, time: dateDetails.time },
      });

      // Save the ride to the database
      await newRide.save();
      res
        .status(201)
        .json({ message: "Ride created successfully!", ride: newRide });
    }
  } catch (err) {
    console.error("Error creating ride:", err);
    res.status(500).json({ error: "Failed to create the ride" });
  }
});

// PUT request for updating a ride
rideRouter.put("/update-ride/:rideId", async (req, res) => {
  try {
    const { rideId } = req.params;
    const {
      userId,
      from,
      to,
      available_seat,
      amount_per_seat,
      shuttle,
      dateDetails,
    } = req.body;

    // Find the ride by its ID and ensure it belongs to the user making the request
    const ride = await Ride.findOne({ _id: rideId, userId });

    if (!ride) {
      return res.status(404).json({
        error:
          "Ride not found or you do not have permission to update this ride",
      });
    }

    // Update the ride details if found and permission is verified
    ride.from = from
      ? { latitude: from.latitude, longitude: from.longitude }
      : ride.from;
    ride.to = to ? { latitude: to.latitude, longitude: to.longitude } : ride.to;
    ride.available_seat =
      available_seat !== undefined ? available_seat : ride.available_seat;
    ride.amount_per_seat =
      amount_per_seat !== undefined ? amount_per_seat : ride.amount_per_seat;
    ride.shuttle = shuttle !== undefined ? shuttle : ride.shuttle;
    ride.dateDetails = shuttle
      ? {
          start_date: dateDetails.start_date,
          end_date: dateDetails.end_date,
          time: dateDetails.time,
        }
      : { date: dateDetails.date, time: dateDetails.time };

    // Save the updated ride
    await ride.save();
    res.status(200).json({ message: "Ride updated successfully!", ride });
  } catch (err) {
    console.error("Error updating ride:", err);
    res.status(500).json({ error: "Failed to update the ride" });
  }
});

rideRouter.get("/get-rides", async (req, res) => {
  try {
    let rides = await Ride.find({ uid: req.user });
    return res.json(rides);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

module.exports = rideRouter;
