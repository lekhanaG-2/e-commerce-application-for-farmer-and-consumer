const mongoose = require('mongoose');

const specialOrderSchema = new mongoose.Schema({
  consumer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  farmer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // For single product special orders
  product_name: {
    type: String,
    required: function() { return !this.is_bulk_order; }
  },
  description: {
    type: String,
    required: function() { return !this.is_bulk_order; }
  },
  quantity: {
    type: Number,
    required: function() { return !this.is_bulk_order; },
    min: 1
  },
  unit: {
    type: String,
    required: function() { return !this.is_bulk_order; }
  },
  preferred_price: {
    type: Number,
    required: function() { return !this.is_bulk_order; },
    min: 0
  },
  // For bulk orders
  is_bulk_order: {
    type: Boolean,
    default: false
  },
  items: [{
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    qty: { type: Number, required: true },
    unit: { type: String, required: true },
    price_per_unit: { type: Number, required: true }
  }],
  eventType: {
    type: String,
    enum: ['Wedding', 'Birthday', 'Corporate', 'Festival', 'Other']
  },
  notes: {
    type: String
  },
  // Common fields
  delivery_date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  consumer_address: {
    type: String,
    required: true
  },
  consumer_phone: {
    type: String,
    required: true
  },
  farmer_response: {
    type: String
  },
  farmer_price: {
    type: Number
  },
  farmer_notes: {
    type: String
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Update the updated_at field before saving
specialOrderSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('SpecialOrder', specialOrderSchema);
