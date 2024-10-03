const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  from: {
    type: String,  
    required: true
  },
  to: {
    type: String,  
    required: true
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
    type: Object, 
    required: true
  }
});

const Ride = mongoose.model('Ride', rideSchema);

module.exports = Ride;
