const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  address: { type: String, required: true },
  verified: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  aadhaar: { type: String },
  status: { type: String, enum: ['active', 'inactive', 'blocked'], default: 'active' },
  email_verified: { type: Boolean, default: true },
  phone_verified: { type: Boolean, default: true },
  role: { type: String, enum: ['consumer', 'farmer', 'admin'], default: 'consumer' },
  address: { type: String },
  profile_photo: { type: String },
  email_notifications: { type: Boolean, default: true },
  push_notifications: { type: Boolean, default: true },
  sms_notifications: { type: Boolean, default: true },
  // Farmer specific fields
  farm_name: { type: String },
  location: { type: String },
  farm_size: { type: String },
  farming_type: { type: String },
  experience: { type: String },
  certifications: { type: [String], default: [] },
  id_proof: { type: String },
  addresses: [addressSchema],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Update the updated_at field before saving
userSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);
