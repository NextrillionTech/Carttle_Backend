const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User' 
  },
  from: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: {
      type: [Number],
      required: true,
    }
  },
  to: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: {
      type: [Number],
      required: true,
    }
  },
  available_seat: {
    type: Number,
    required: true
  },
  amount_per_seat: {
    type: Number,
    required: true
  },
  shuttle: {
    type: Boolean,
    required: true
  },
  dateDetails: {
    date: { 
      type: Date, 
      required: function() { return !this.shuttle; } 
    },
    start_date: { 
      type: Date, 
      required: function() { return this.shuttle; } 
    },
    end_date: { 
      type: Date, 
      required: function() { return this.shuttle; } 
    },
    time: { 
      type: String, 
      required: true,
    },
    round_trip_time: {
      type: String,
      required: function() { return this.round_trip; }
    }
  },
  round_trip: {
    type: Boolean,
    default: false
  },
});

rideSchema.index({ from: "2dsphere" });
rideSchema.index({ to: "2dsphere" });

const Ride = mongoose.model('Ride', rideSchema);

module.exports = Ride;
