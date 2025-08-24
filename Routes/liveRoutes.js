// backend/Routes/liveRoutes.js
import express from "express";
import multer from "multer";
import cloudinary from "../cloudinary.js";
import LiveSession from "../Models/LiveSession.js";
import streamifier from "streamifier"; // Needed to convert buffer to stream

const router = express.Router();

// Multer setup for file upload (memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// =======================
// Create new live session (Admin)
// =======================
router.post("/", upload.single("poster"), async (req, res) => {
  try {
    const { title, description, youtubeLink, startTime } = req.body;

    if (!title || !youtubeLink || !startTime) {
      return res.status(400).json({
        message: "Title, YouTube link, and StartTime are required",
      });
    }

    let posterUrl = null;

    // Upload image to Cloudinary
    if (req.file) {
      posterUrl = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "live_posters" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
      });
    }

    const newLive = new LiveSession({
      title,
      description,
      youtubeLink,
      startTime,
      poster: posterUrl,
      status: "upcoming",
    });

    const savedLive = await newLive.save();
    res.status(201).json(savedLive);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
});

// =======================
// Get all live sessions (Admin)
// =======================
router.get("/", async (req, res) => {
  try {
    const lives = await LiveSession.find().sort({ startTime: -1 });
    res.json(lives);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// =======================
// Get live history (ended sessions for users)
// =======================
router.get("/history", async (req, res) => {
  try {
    const endedSessions = await LiveSession.find({ status: "ended" }).sort({ endTime: -1 });
    res.json(endedSessions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// =======================
// Update live session (Admin) including status
// =======================
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const updatedLive = await LiveSession.findByIdAndUpdate(
      req.params.id,
      { status, endTime: status === "ended" ? new Date() : undefined },
      { new: true }
    );
    if (!updatedLive) {
      return res.status(404).json({ message: "Live session not found" });
    }
    res.json(updatedLive);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
