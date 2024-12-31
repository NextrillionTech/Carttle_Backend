const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  driver: {
    name: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  from: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true },
  },
  to: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true },
  },
  starting_location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true },
  },
  available_seat: { type: Number, required: true },
  amount_per_seat: { type: Number, required: true },
  shuttle: { type: Boolean, required: true, default: false },
  dateDetails: {
    date: { type: Date, required: function () { return !this.shuttle; } },
    start_date: {
      type: Date,
      validate: {
        validator: function (value) { return this.shuttle ? value != null : true; },
        message: "Start date is required when shuttle is true.",
      },
    },
    end_date: {
      type: Date,
      validate: {
        validator: function (value) { return this.shuttle ? value != null : true; },
        message: "End date is required when shuttle is true.",
      },
    },
    time: { type: String, required: true },
    round_trip_time: {
      type: String,
      validate: {
        validator: function (value) { return this.round_trip ? value != null : true; },
        message: "Round trip time is required when round_trip is true.",
      },
    },
  },
  round_trip: { type: Boolean, default: false },
  travellers: [{
    name: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  }],
  status: { type: String, enum: ['upcoming', 'canceled', 'completed'], default: 'upcoming' },
});

// Add 2dsphere indexes for from and to fields
rideSchema.index({ from: "2dsphere" });
rideSchema.index({ to: "2dsphere" });

// Middleware to set starting_location on first creation
rideSchema.pre('save', function (next) {
  if (this.isNew) {
    this.starting_location = { type: 'Point', coordinates: this.from.coordinates };
  }
  next();
});

const Ride = mongoose.model('Ride', rideSchema);

module.exports = Ride;
