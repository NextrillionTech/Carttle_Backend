const mongoose = require('mongoose');

const vehicleVerificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reg_no: { type: String, required: true },
  owner_name: { type: String, required: true },
  vehicle_class_desc: { type: String, required: true },
  model: { type: String, required: true },
  state: { type: String, required: true },
  current_full_address: { type: String, required: true },
});

const VehicleVerification = mongoose.model('VehicleVerification', vehicleVerificationSchema);

module.exports = VehicleVerification;
