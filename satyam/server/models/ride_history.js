const mongoose = require('mongoose');

const rideHistorySchema = new mongoose.Schema({
  user: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true
    }
  },
  history: [
    {
      type: mongoose.Schema.Types.Mixed 
    }
  ]
});

const RideHistory = mongoose.model('RideHistory', rideHistorySchema);
module.exports = RideHistory;
