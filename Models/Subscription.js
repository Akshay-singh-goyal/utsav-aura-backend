const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  name: String,
  type: String,
  price: String,
  status: String // Paid, Expiring, Canceled
}, { timestamps: true });

module.exports = mongoose.model("Subscription", subscriptionSchema);
