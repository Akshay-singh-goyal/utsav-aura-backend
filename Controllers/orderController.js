// controllers/orderController.js
import Order from "../Models/Order.js";
import { v4 as uuidv4 } from "uuid";

/**
 * =========================
 * CREATE ORDER
 * =========================
 */
export const createOrder = async (req, res) => {
  try {
    const {
      userId,
      items,
      shipping,
      paymentMethod,
      total,
      note,
      upiDetails,
    } = req.body;

    // ✅ Validate
    if (!userId) return res.status(400).json({ error: "User ID is required" });
    if (!items || items.length === 0)
      return res.status(400).json({ error: "Cart items are required" });
    if (!shipping) return res.status(400).json({ error: "Shipping info is required" });
    if (!paymentMethod) return res.status(400).json({ error: "Payment method is required" });
    if (!total) return res.status(400).json({ error: "Total amount is required" });

    const safeUpiDetails =
      paymentMethod === "upi"
        ? {
            txnId: upiDetails?.txnId || "",
            ownerName: upiDetails?.ownerName || "",
            extra: upiDetails?.extra || "",
          }
        : {};

    const order = new Order({
      orderId: uuidv4(),
      userId,
      items,
      shipping,
      paymentMethod,
      upiDetails: safeUpiDetails,
      total,
      note,
      status: "Pending",
    });

    await order.save();

    if (req.io) req.io.emit("orderUpdated", order);

    res.status(201).json(order);
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
};

/**
 * =========================
 * GET ALL ORDERS (ADMIN)
 * =========================
 */
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("Fetch all orders error:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

/**
 * =========================
 * GET ORDERS BY USER
 * =========================
 */
export const getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: "User ID is required" });

    const orders = await Order.find({ userId }).populate("userId", "name email");
    res.json(orders);
  } catch (err) {
    console.error("Fetch user orders error:", err);
    res.status(500).json({ error: "Failed to fetch user orders" });
  }
};

/**
 * =========================
 * UPDATE ORDER STATUS
 * =========================
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: "Status is required" });

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("userId", "name email");

    if (!updatedOrder) return res.status(404).json({ error: "Order not found" });

    if (req.io) req.io.emit("orderUpdated", updatedOrder);

    res.json(updatedOrder);
  } catch (err) {
    console.error("Update order status error:", err);
    res.status(500).json({ error: "Failed to update order status" });
  }
};

/**
 * =========================
 * GET ORDER BY ID
 * =========================
 */
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("userId", "name email")
      .populate("items.productId", "name price image");

    if (!order) return res.status(404).json({ error: "Order not found" });

    res.json(order);
  } catch (err) {
    console.error("Fetch order error:", err);
    res.status(500).json({ error: "Failed to fetch order" });
  }
};
