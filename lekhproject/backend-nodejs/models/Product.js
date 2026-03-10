const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image_url: { type: String },
  stock_quantity: { type: Number, default: 0 },
  unit: { type: String, default: 'kg' },
  farmer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  minimumOrder: { type: Number, default: 0 },
  product_type: { type: String, enum: ['regular', 'bulk'], default: 'regular' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Update the updated_at field before saving
productSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('Product', productSchema);
