import express from "express";
import Chat from "../Models/Chat.js";
import { verifyToken } from "../Middlewares/Auth.js";

const router = express.Router();

// Get logged-in user's chat
router.get("/me", verifyToken, async (req, res) => {
  try {
    let chat = await Chat.findOne({ user: req.user._id }).populate("user", "name email");
    if (!chat) {
      chat = await Chat.create({ user: req.user._id, messages: [] });
    }
    res.json(chat);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Add message to chat
router.post("/send", verifyToken, async (req, res) => {
  try {
    const { text } = req.body;
    let chat = await Chat.findOne({ user: req.user._id });

    if (!chat) {
      chat = await Chat.create({
        user: req.user._id,
        messages: [{ sender: "user", text }]
      });
    } else {
      chat.messages.push({ sender: "user", text });
      await chat.save();
    }

    res.json(chat);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all chats (Admin only)
router.get("/all", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Access denied" });
  }
  const chats = await Chat.find().populate("user", "name email");
  res.json(chats);
});

// Admin send message to a specific user
router.post("/admin/:chatId", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Access denied" });
  }
  const { text } = req.body;
  const chat = await Chat.findById(req.params.chatId);
  if (!chat) return res.status(404).json({ success: false, message: "Chat not found" });

  chat.messages.push({ sender: "admin", text });
  await chat.save();
  res.json(chat);
});


export default router;
