const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const Chat = require('../Models/Chat');
const Message = require('../Models/Message');

/**
 * Admin: get all open chats (pagination optional)
 */
router.get('/chats', auth, adminOnly, async (req, res) => {
  const chats = await Chat.find().populate('user').sort({ updatedAt: -1 }).limit(50);
  res.json(chats);
});

/**
 * Admin: send message to a chat
 * POST /admin/chat/:id/send  { text }
 */
router.post('/chat/:id/send', auth, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ message: 'Empty message' });

    const chat = await Chat.findById(id);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    const message = await Message.create({
      roomId: chat._id,
      sender: 'admin',
      text,
      status: 'sent'
    });

    chat.lastMessageAt = new Date();
    await chat.save();

    // Optionally: notify via socket (socket module will be wired to receive admin send events)
    res.json({ ok: true, message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Admin: close chat
 */
router.post('/chat/:id/close', auth, adminOnly, async (req, res) => {
  const chat = await Chat.findById(req.params.id);
  if (!chat) return res.status(404).json({ message: 'Chat not found' });
  chat.isClosed = true;
  await chat.save();
  // notify via socket in socket module
  res.json({ ok: true });
});

module.exports = router;
