const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  }
});

const rideSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  from: {
    type: locationSchema,
    required: true
  },
  to: {
    type: locationSchema,
    required: true
  },
  available_seat: {
    type: Number,
    required: true,
    min: 1
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
    type: {
      start_date: { type: Date, required: function() { return this.shuttle === true; } },
      end_date: { type: Date, required: function() { return this.shuttle === true; } },
      date: { type: Date, required: function() { return this.shuttle === false; } },
      time: { 
        type: String, 
        required: function() { return this.shuttle === true || this.shuttle === false; } 
      }
    }
  }
});

const Ride = mongoose.model('Ride', rideSchema);

module.exports = Ride;
