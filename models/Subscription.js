
const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  plan: { type: String }, // monthly / yearly / custom
  price: Number,
  startDate: Date,
  endDate: Date,
  status: { type: String, enum: ['active','cancelled','expired'], default: 'active' }
});

module.exports = mongoose.model('Subscription', SubscriptionSchema);
