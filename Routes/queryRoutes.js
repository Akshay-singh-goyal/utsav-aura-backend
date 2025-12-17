import express from "express";
import Query from "../Models/Query.js";

const router = express.Router();

// ========================
// Create Contact Query
// ========================
router.post("/create", async (req, res) => {
  try {
    const { userId, name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const query = new Query({ userId, name, email, subject, message });
    await query.save();
    res.status(201).json({ message: "Query submitted successfully", query });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ========================
// Get All Queries (Admin)
// ========================
router.get("/all", async (req, res) => {
  try {
    const queries = await Query.find().populate("userId", "name email").sort({ createdAt: -1 });
    res.json(queries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ========================
// Update Query Status (Admin)
// ========================
router.patch("/status/:id", async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: "Status is required" });

    const updatedQuery = await Query.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedQuery) return res.status(404).json({ error: "Query not found" });
    res.json(updatedQuery);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
