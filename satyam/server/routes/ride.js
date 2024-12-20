const express = require("express");
const rideRouter = express.Router();
const Ride = require("../models/ride");
const RideHistory = require("../models/ride_history");

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
    const { driver, from, to, available_seat, amount_per_seat, shuttle, dateDetails, round_trip } = req.body;
    const fromCoordinates = { type: "Point", coordinates: [from.longitude, from.latitude] };
    const toCoordinates = { type: "Point", coordinates: [to.longitude, to.latitude] };

    const updateRideHistory = async (driverUserId, driverName, rideData) => {
      const rideHistory = await RideHistory.findOneAndUpdate(
        { "user.userId": driverUserId },
        {
          $set: { "user.name": driverName, "user.userId": driverUserId },
          $push: { history: { $each: rideData } }
        },
        { new: true, upsert: true }
      );
      return rideHistory;
    };

    if (round_trip && !dateDetails.round_trip_time) {
      return res.status(400).json({ error: "Round trip time is required for a round trip." });
    }

    if (shuttle) {
      const dates = getDatesBetween(dateDetails.start_date, dateDetails.end_date);

      await Promise.all(dates.map(async (date) => {
        const existingRide = await Ride.findOne({
          "driver.userId": driver.userId,
          "dateDetails.date": date,
          "dateDetails.time": dateDetails.time,
        });
        if (existingRide) {
          throw new Error(`A ride is already scheduled on ${date} at ${dateDetails.time}`);
        }
      }));

      const rideEntries = dates.flatMap((date) => {
        const rideData = {
          driver: { name: driver.name, userId: driver.userId },
          from: fromCoordinates,
          to: toCoordinates,
          available_seat,
          amount_per_seat,
          shuttle: true,
          dateDetails: { date, time: dateDetails.time },
        };
        if (round_trip) {
          return [
            rideData,
            {
              ...rideData,
              from: toCoordinates,
              to: fromCoordinates,
              round_trip: true,
              dateDetails: { ...rideData.dateDetails, time: dateDetails.round_trip_time }
            }
          ];
        }
        return [rideData];
      });

      await Ride.insertMany(rideEntries);
      await updateRideHistory(driver.userId, driver.name, rideEntries);

      res.status(201).json({ message: "Shuttle ride created for all days successfully!", rides: rideEntries });
    } else {
      const existingRide = await Ride.findOne({
        "driver.userId": driver.userId,
        "dateDetails.date": dateDetails.date,
        "dateDetails.time": dateDetails.time,
      });

      if (existingRide) {
        return res.status(400).json({ error: "You already have a ride scheduled at this date and time." });
      }

      const rideData = {
        driver: { name: driver.name, userId: driver.userId },
        from: fromCoordinates,
        to: toCoordinates,
        available_seat,
        amount_per_seat,
        shuttle: false,
        dateDetails: { date: dateDetails.date, time: dateDetails.time },
      };
      const newRide = await new Ride(rideData).save(); 

      if (round_trip) {
        const roundTripData = {
          ...rideData,
          from: toCoordinates,
          to: fromCoordinates,
          round_trip: true,
          dateDetails: { ...rideData.dateDetails, time: dateDetails.round_trip_time }
        };
        await new Ride(roundTripData).save();
        await updateRideHistory(driver.userId, driver.name, [rideData, roundTripData]); 
      } else {
        await updateRideHistory(driver.userId, driver.name, [rideData]); 
        return res.status(201).json({ message: "Non-shuttle ride created successfully!", rideId: newRide._id });
      }

      res.status(201).json({ message: "Non-shuttle round-trip ride created successfully!" });
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
  const { currentLocation, to, dateDetails, maxDistance = 500, available_seat } = req.body;

  if (!currentLocation || !to || !dateDetails || !dateDetails.date || !dateDetails.time) {
    return res.status(400).json({ error: "Current location, destination, date, and time are required" });
  }

  try {
    const specifiedDate = new Date(dateDetails.date);
    const userTime = new Date(`${dateDetails.date}T${dateDetails.time}:00Z`);

    // Step 1: Find rides near the current location on the specified date
    const ridesNearCurrentLocation = await Ride.find({
      currentLocation: {
        $near: {
          $geometry: { type: "Point", coordinates: [currentLocation.longitude, currentLocation.latitude] },
          $maxDistance: maxDistance,
        },
      },
      "dateDetails.date": specifiedDate,
      ...(available_seat && { available_seat: { $gte: available_seat } }),
    });

    // Step 2: Filter rides within 500m of the destination location and within 15 minutes of the user's time
    const filteredRides = ridesNearCurrentLocation.filter((ride) => {
      const [rideLongitude, rideLatitude] = ride.to.coordinates;
      const distanceToDestination = calculateDistance(
        { lat: rideLatitude, lng: rideLongitude },
        { lat: to.latitude, lng: to.longitude }
      );

      const rideTime = new Date(`${ride.dateDetails.date.toISOString().split("T")[0]}T${ride.dateDetails.time}:00Z`);
      const timeDifference = Math.abs(rideTime - userTime) / (1000 * 60);

      return distanceToDestination <= 500 && timeDifference <= 15;
    });

    res.json(filteredRides);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Helper function to calculate distance between two geographic coordinates
function calculateDistance(coord1, coord2) {
  const R = 6371000; 
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

// Endpoint to add a traveler to a ride and decrease available seats
rideRouter.post('/rides/:rideId/join', async (req, res) => {
  const { rideId } = req.params;
  const { userId, name } = req.body;

  if (!userId || !name) {
    return res.status(400).json({ error: "UserId and name are required" });
  }

  try {
    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({ error: "Ride not found" });
    }

    if (ride.available_seat <= 0) {
      return res.status(400).json({ error: "No available seats left" });
    }

    ride.travellers.push({ userId, name });
    ride.available_seat -= 1;

    await ride.save();

    await updateTravelerHistory(userId, name, ride);

    res.json({
      message: "Traveler added successfully, available seats updated",
      ride,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Function to update traveler's history record
const updateTravelerHistory = async (travelerUserId, travelerName, rideData) => {
  const travelHistory = await RideHistory.findOneAndUpdate(
    { "user.userId": travelerUserId },
    {
      $set: { "user.name": travelerName, "user.userId": travelerUserId },
      $push: { history: rideData }
    },
    { new: true, upsert: true }
  );
  return travelHistory;
};

// GET API to fetch details of a specific ride, including driver and travelers
rideRouter.get("/rides/:rideId", async (req, res) => {
  const { rideId } = req.params;

  try {
    const ride = await Ride.findById(rideId).select("driver travellers");

    if (!ride) {
      return res.status(404).json({ error: "Ride not found" });
    }

    const rideDetails = {
      driver: {
        name: ride.driver.name,
        userId: ride.driver.userId,
      },
      travellers: ride.travellers.length ? ride.travellers : "No travelers yet"
    };

    return res.json(rideDetails);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});


module.exports = rideRouter;