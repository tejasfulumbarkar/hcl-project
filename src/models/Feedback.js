const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  productId: { type: String },
  type: { type: String, enum: ['bug','suggestion','compliment','other'], required: true },
  rating: { type: Number, min: 1, max: 5 },
  message: { type: String, required: true },
  email: { type: String },
  status: { type: String, enum: ['new','reviewed','closed'], default: 'new' }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', FeedbackSchema);
