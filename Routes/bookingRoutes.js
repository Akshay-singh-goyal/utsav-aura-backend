import express from "express";
import Booking from "../Models/Booking.js";
import { verifyUser, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();
// bookingRoutes.js
router.put("/:id", verifyAdmin, async (req, res) => {
  try {
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.status(200).json(updatedBooking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// User Booking
router.post("/", verifyUser, async (req, res) => {
  try {
    const booking = new Booking({ ...req.body, userId: req.user.id });
    const savedBooking = await booking.save();
    res.status(201).json(savedBooking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get User Bookings
router.get("/my-bookings", verifyUser, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id }).populate("packageId");
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Get All Bookings
router.get("/", verifyAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find().populate("userId packageId");
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
