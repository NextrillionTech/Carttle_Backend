const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema({
  rideId: {
    type: mongoose.Schema.Types.ObjectId, // Assuming this links to a Ride collection
    required: true,
    ref: "Ride"
  },
  driver: {
    name: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  travellers: [
    {
      name: {
        type: String,
        required: true,
      },
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    }
  ],
  from: {
    type: String, // In format "latitude,longitude"
    required: true,
  },
  to: {
    type: String, // In format "latitude,longitude"
    required: true,
  },
  earning: {
    type: Number,
    required: false,
  },
  review: {
    type: String,
    default: ""
  },
  date: {
    type: Date,
    required: true,
  },
  tripStartTime: {
    type: String, // Store as "HH:MM" or Date if needed
    required: true,
  },
  tripEndTime: {
    type: String, // Store as "HH:MM" or Date if needed
    required: false,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  totalSeatsAvailable: {
    type: Number,
    required: true,
  },
});

// Create the Trip model
const Trip = mongoose.model("Trip", tripSchema);

module.exports = Trip;
