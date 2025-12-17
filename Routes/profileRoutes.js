// routes/profile.js
import express from "express";
import User from "../Models/User.js";
import Order from "../Models/Order.js";
import { requireAuth } from "../Middlewares/Auth.js"; // ✅ correct import

const router = express.Router();

// ✅ GET user profile with all orders
router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-__v -password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate("items.productId", "name price");

    res.json({ success: true, user, orders });
  } catch (err) {
    console.error("GET /me error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ GET all orders for logged-in user
router.get("/orders", requireAuth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate("items.productId", "name price");

    res.json({ success: true, orders });
  } catch (err) {
    console.error("GET /orders error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ PUT update user profile
router.put("/update", requireAuth, async (req, res) => {
  try {
    const { firstName, lastName, email, phone, address, city, state, zip, country } = req.body;

    // Find the user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update fields if provided
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.address = address || user.address;
    user.city = city || user.city;
    user.state = state || user.state;
    user.zip = zip || user.zip;
    user.country = country || user.country;

    await user.save();

    // ✅ Update latest order snapshot
    const latestOrder = await Order.findOne({ user: user._id }).sort({ createdAt: -1 });
    if (latestOrder) {
      latestOrder.userSnapshot = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        city: user.city,
        state: user.state,
        zip: user.zip,
        country: user.country,
      };
      await latestOrder.save();
    }

    res.json({ success: true, message: "Profile updated successfully", user });
  } catch (err) {
    console.error("PUT /update error:", err);
    res.status(500).json({ success: false, message: "Failed to update profile" });
  }
});

export default router;
