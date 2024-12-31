// models/dlVerification.js

const mongoose = require('mongoose');

// Define the schema for vehicle verification
const drivingVerificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  dlnumber: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  dob: {
    type: String,
    required: true
  },
  blood_group: {
    type: String,
    required: false 
  },
  permanent_address: {
    type: String,
    required: false 
  },
  issue_date: {
    type: String,
    required: false 
  },
  nt_validity_from: {
    type: String,
    required: false 
  },
  nt_validity_to: {
    type: String,
    required: false 
  },
  image: {
    type: String,
    required: false 
  },
  verifiedAt: {
    type: Date,
    default: Date.now
  }
});

// Create and export the model
const drivingVerification = mongoose.model('drivingVerification', drivingVerificationSchema);

module.exports = drivingVerification;
