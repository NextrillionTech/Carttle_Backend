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
  try {
    const {
      userId,
      from,
      to,
      available_seat,
      amount_per_seat,
      shuttle,
      dateDetails,
      round_trip,
    } = req.body;

    // Transform the coordinates to GeoJSON format for MongoDB
    const fromCoordinates = { type: "Point", coordinates: [from.longitude, from.latitude] };
    const toCoordinates = { type: "Point", coordinates: [to.longitude, to.latitude] };

    if (shuttle) {
      const dates = getDatesBetween(dateDetails.start_date, dateDetails.end_date);
      const rideEntries = [];

      const checkExistingRides = dates.map(async (date) => {
        const existingRide = await Ride.findOne({
          userId,
          "dateDetails.date": date,
          "dateDetails.time": dateDetails.time,
        });
        if (existingRide) {
          throw new Error(`A ride is already scheduled at this date and time: ${date} ${dateDetails.time}`);
        }
      });

      await Promise.all(checkExistingRides);

      dates.forEach((date) => {
        rideEntries.push({
          userId,
          from: fromCoordinates,
          to: toCoordinates,
          available_seat,
          amount_per_seat,
          shuttle: true,
          dateDetails: {
            date,
            time: dateDetails.time,
            start_date: dateDetails.start_date,
            end_date: dateDetails.end_date,
          },
        });

        if (round_trip) {
          rideEntries.push({
            userId,
            from: toCoordinates,
            to: fromCoordinates,
            available_seat,
            amount_per_seat,
            shuttle: true,
            round_trip: true,
            dateDetails: {
              date,
              time: dateDetails.round_trip_time,
              start_date: dateDetails.start_date,
              end_date: dateDetails.end_date,
              round_trip_time: dateDetails.round_trip_time,
            },
          });
        }
      });

      await Ride.insertMany(rideEntries);

      res.status(201).json({
        message: "Shuttle ride created for all days successfully!",
        rides: rideEntries,
      });
    } else {
      const existingRide = await Ride.findOne({
        userId,
        "dateDetails.date": dateDetails.date,
        "dateDetails.time": dateDetails.time,
        "dateDetails.round_trip_time": dateDetails.round_trip_time,
      });

      if (existingRide) {
        return res.status(400).json({
          error: "You already have a ride scheduled at this date and time.",
        });
      }

      const rideEntry = new Ride({
        userId,
        from: fromCoordinates,
        to: toCoordinates,
        available_seat,
        amount_per_seat,
        shuttle: false,
        dateDetails: {
          date: dateDetails.date,
          time: dateDetails.time,
          ...(round_trip && { round_trip_time: dateDetails.round_trip_time }),
        },
      });

      await rideEntry.save();

      if (round_trip) {
        const roundTripEntry = new Ride({
          userId,
          from: toCoordinates,
          to: fromCoordinates,
          available_seat,
          amount_per_seat,
          shuttle: false,
          round_trip: true,
          dateDetails: {
            date: dateDetails.date,
            time: dateDetails.round_trip_time,
            round_trip_time: dateDetails.round_trip_time,
          },
        });
        await roundTripEntry.save();
      }

      res.status(201).json({
        message: "Non-shuttle ride created successfully!",
      });
    }
  } catch (err) {
    console.error("Error creating ride:", err);
    res.status(500).json({ error: "Failed to create the ride" });
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

rideRouter.post("/rides/search", async (req, res) => {
  const { from, to, dateDetails } = req.body;

  if (!from || !to || !dateDetails || !dateDetails.date || !dateDetails.time) {
    return res.status(400).json({ error: "Origin, destination, date, and time are required" });
  }

  try {
    const specifiedDate = new Date(dateDetails.date);
    const userTime = new Date(`${dateDetails.date}T${dateDetails.time}:00Z`);

    // Step 1: Find rides near the origin location on the specified date
    const ridesNearOrigin = await Ride.find({
      from: {
        $near: {
          $geometry: { type: "Point", coordinates: [from.longitude, from.latitude] },
          $maxDistance: 500,
        },
      },
      "dateDetails.date": specifiedDate,
    });

    // Step 2: Filter rides to include only those within 500m of the destination location and within 1 hour of the user's time
    const filteredRides = ridesNearOrigin.filter((ride) => {
      const [rideLongitude, rideLatitude] = ride.to.coordinates;
      const distanceToDestination = calculateDistance(
        { lat: rideLatitude, lng: rideLongitude },
        { lat: to.latitude, lng: to.longitude }
      );
    
      // Convert ride time to Date object
      const rideTime = new Date(`${ride.dateDetails.date.toISOString().split("T")[0]}T${ride.dateDetails.time}:00Z`);
      const timeDifference = Math.abs(rideTime - userTime) / (1000 * 60); // Difference in minutes
    
      // Check if destination is within 500m and time difference is 15 minutes or less
      return distanceToDestination <= 500 && timeDifference <= 15;
    });
    
    res.json(filteredRides);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to calculate distance between two geographic coordinates
function calculateDistance(coord1, coord2) {
  const R = 6371000; // Radius of Earth in meters
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
    Math.cos((coord2.lat * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

module.exports = rideRouter;
