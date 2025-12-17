import express from "express";
import Order from "../Models/Order.js";
import { v4 as uuidv4 } from "uuid";
import cors from "cors";

const router = express.Router();

// =========================
// CORS setup
// =========================
const allowedOrigins = [
  "http://localhost:3000",
  "https://utsav-aura.vercel.app"
];

router.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow non-browser requests
      if (!allowedOrigins.includes(origin)) return callback(new Error("Not allowed by CORS"));
      return callback(null, true);
    },
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

router.options("*", cors());

// =========================
// CREATE ORDER
// =========================
router.post("/create", async (req, res) => {
  try {
    const { userId, items, shipping, paymentMethod, total, note, upiDetails } = req.body;

    // Validation
    if (!userId) return res.status(400).json({ error: "User ID is required" });
    if (!items || items.length === 0) return res.status(400).json({ error: "Cart items are required" });
    if (!shipping) return res.status(400).json({ error: "Shipping info is required" });
    if (!paymentMethod) return res.status(400).json({ error: "Payment method is required" });
    if (!total) return res.status(400).json({ error: "Total amount is required" });

    // Safe UPI details
    const safeUpiDetails = paymentMethod === "upi"
      ? {
          txnId: upiDetails?.txnId || "",
          ownerName: upiDetails?.ownerName || "",
          extra: upiDetails?.extra || "",
        }
      : {};

    const order = new Order({
      orderId: uuidv4(),
      userId,
      items: items.map(item => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity || 1,
        price: item.price,
        mode: item.mode || "Buy",
        rentalStart: item.rentalStart,
        rentalEnd: item.rentalEnd,
      })),
      shipping,
      paymentMethod,
      upiDetails: safeUpiDetails,
      total,
      note,
      status: "Pending",
    });

    await order.save();

    // Emit real-time update via Socket.IO if available
    if (req.io) req.io.emit("orderUpdated", order);

    res.status(201).json(order);
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ error: err.message });
  }
});

// =========================
// GET ALL ORDERS (ADMIN)
// =========================
router.get("/all", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    console.error("Fetch all orders error:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// =========================
// GET ORDERS BY USER
// =========================
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: "User ID is required" });

    const orders = await Order.find({ userId })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (err) {
    console.error("Fetch user orders error:", err);
    res.status(500).json({ message: "Server error fetching orders" });
  }
});

// =========================
// UPDATE ORDER STATUS / UPI DETAILS
// =========================
router.patch("/status/:id", async (req, res) => {
  try {
    const { status, upiDetails } = req.body;

    if (!status && !upiDetails)
      return res.status(400).json({ error: "Status or UPI details are required" });

    const updateData = {};
    if (status) updateData.status = status;
    if (upiDetails) {
      updateData.upiDetails = {
        txnId: upiDetails?.txnId || "",
        ownerName: upiDetails?.ownerName || "",
        extra: upiDetails?.extra || "",
      };
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate("userId", "name email");

    if (!updatedOrder) return res.status(404).json({ error: "Order not found" });

    if (req.io) req.io.emit("orderUpdated", updatedOrder);

    res.status(200).json(updatedOrder);
  } catch (err) {
    console.error("Update order error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
