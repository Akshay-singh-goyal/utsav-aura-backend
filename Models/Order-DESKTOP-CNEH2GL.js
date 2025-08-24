import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  items: [
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }, // remove `required: true`
    name: String,
    quantity: Number,
    price: Number,
    mode: { type: String, enum: ["Buy", "Rent"], default: "Buy" },
    rentalStart: Date,
    rentalEnd: Date,
  }
],

});

const upiDetailsSchema = new mongoose.Schema({
  txnId: { type: String },
  ownerName: { type: String },
  extra: { type: String },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true }, // unique order identifier
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [orderItemSchema],
  total: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"],
    default: "Pending",
  },
  shipping: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    zip: String,
    country: { type: String, default: "India" },
  },
  paymentMethod: { type: String, enum: ["cod", "upi", "card"], required: true },
  upiDetails: upiDetailsSchema,
  note: String,
}, { timestamps: true });

// Auto-generate orderId if not provided
orderSchema.pre("save", function(next) {
  if (!this.orderId) {
    this.orderId = "ORD-" + Date.now();
  }
  next();
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
