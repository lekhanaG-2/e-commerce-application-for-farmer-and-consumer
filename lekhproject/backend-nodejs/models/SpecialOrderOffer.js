const mongoose = require('mongoose');

const specialOrderOfferSchema = new mongoose.Schema({
  farmer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product_name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unit: {
    type: String,
    required: true
  },
  price_per_unit: {
    type: Number,
    required: true,
    min: 0
  },
  minimum_order: {
    type: Number,
    default: 1,
    min: 1
  },
  available_from: {
    type: Date,
    required: true
  },
  available_until: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired'],
    default: 'active'
  },
  delivery_options: {
    type: [String], // e.g., ['home_delivery', 'pickup']
    default: ['home_delivery']
  },
  payment_terms: {
    type: String,
    default: 'Cash on delivery'
  },
  notes: {
    type: String
  },
  image: {
    type: String // Path to uploaded image file
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
specialOrderOfferSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Index for efficient queries
specialOrderOfferSchema.index({ farmer_id: 1, status: 1 });
specialOrderOfferSchema.index({ available_until: 1 });

module.exports = mongoose.model('SpecialOrderOffer', specialOrderOfferSchema);
