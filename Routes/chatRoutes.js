import express from "express";
import Chat from "../Models/Chat.js";
import User from "../Models/User.js";

const router = express.Router();

// Get current user's chat
router.get("/me", async (req, res) => {
  try {
    const userId = req.user._id; // assume authentication middleware
    let chat = await Chat.findOne({ user: userId }).populate("user", "name email");
    if (!chat) {
      chat = await Chat.create({ user: userId, messages: [] });
    }
    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Send message
router.post("/send", async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.user._id;
    let chat = await Chat.findOne({ user: userId });
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    if (chat.isClosed) return res.status(400).json({ message: "Chat is closed" });

    const msg = { sender: "user", text };
    chat.messages.push(msg);
    await chat.save();

    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin send message
router.post("/admin/send/:chatId", async (req, res) => {
  try {
    const { text } = req.body;
    const { chatId } = req.params;
    let chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    const msg = { sender: "admin", text };
    chat.messages.push(msg);
    await chat.save();

    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// End chat (admin)
// End chat using /close as frontend expects
router.post("/:chatId/close", async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    chat.isClosed = true;
    await chat.save();

    res.status(200).json({ message: "Chat has been closed", isClosed: chat.isClosed });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Continue chat (user)
router.post("/:chatId/continue", async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    chat.isClosed = false;
    await chat.save();

    res.json({ message: "Chat continued" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
