// backend/Routes/dashboard.routes.js
import express from "express";
import Metric from "../Models/Metric.js";
import User from "../Models/User.js"; // ✅ Correct import
import { requireAuth, requireAdmin } from "../Middlewares/Auth.js";

const router = express.Router();

/** Top stat cards */
router.get("/stats", requireAuth, async (_req, res) => {
  try {
    const metrics = await Metric.find().limit(4);
    res.json(metrics);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** Traffic chart data (Jan–Jul) */
router.get("/traffic", requireAuth, async (_req, res) => {
  try {
    res.json({
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
      area: [100, 120, 110, 200, 90, 95, 60],
      line: [170, 130, 140, 120, 80, 160, 165],
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** Social cards */
router.get("/social", requireAuth, async (_req, res) => {
  try {
    res.json([
      { network: "facebook", friends: 89000, feeds: 459 },
      { network: "twitter", followers: 973000, tweets: 1792 },
      { network: "linkedin", contacts: 500, feeds: 292 },
    ]);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** Users table (admin only) */
router.get("/users", requireAuth, requireAdmin, async (_req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).limit(20);
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
