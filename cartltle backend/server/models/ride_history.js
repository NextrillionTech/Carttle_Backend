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
  driving_history: [
    {
      type: mongoose.Schema.Types.Mixed 
    }
  ],
  travelling_history: [
    {
      type: mongoose.Schema.Types.Mixed 
    }
  ]
});

const RideHistory = mongoose.model('RideHistory', rideHistorySchema);
module.exports = RideHistory;
