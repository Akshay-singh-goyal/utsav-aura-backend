import mongoose from "mongoose";

// =========================
// Schema for each product/item in an order
// =========================
const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  price: { type: Number, required: true },
  mode: { type: String, enum: ["Buy", "Rent"], default: "Buy" },
  rentalStart: Date,
  rentalEnd: Date,
}, { _id: false });

// =========================
// Schema for UPI payment details
// =========================
const upiDetailsSchema = new mongoose.Schema({
  txnId: { type: String, default: "" },
  ownerName: { type: String, default: "" },
  extra: { type: String, default: "" },
}, { _id: false });

// =========================
// Main Order schema
// =========================
const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: { type: [orderItemSchema], required: true },
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
  upiDetails: { type: upiDetailsSchema, default: () => ({}) },
  note: String,
}, { timestamps: true });

// =========================
// Auto-generate orderId if not provided
// =========================
orderSchema.pre("validate", function(next) {
  if (!this.orderId) {
    this.orderId = "ORD-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
  }

  // Ensure UPI details object always exists for UPI payment
  if (this.paymentMethod === "upi" && !this.upiDetails) {
    this.upiDetails = { txnId: "", ownerName: "", extra: "" };
  }

  next();
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
