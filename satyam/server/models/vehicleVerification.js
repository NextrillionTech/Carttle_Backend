const mongoose = require('mongoose');

const vehicleVerificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reg_no: { type: String, required: true },
  color: { type: String, required: true },
  rc_model: { type: String, required: true },
  verifiedAt: {
    type: Date,
    default: Date.now
  }
});

const VehicleVerification = mongoose.model('VehicleVerification', vehicleVerificationSchema);

module.exports = VehicleVerification;
