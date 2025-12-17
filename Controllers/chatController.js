import Chat from "../Models/Chat.js";
import Message from "../Models/Message.js";
import mongoose from "mongoose";

// Get chats for logged-in user
export const getMyChat = async (req, res) => {
  try {
    const chats = await Chat.find({ users: { $in: [req.user._id] } })
      .populate("users", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching chats" });
  }
};

// Create one-to-one chat
export const createChat = async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: "UserId not sent" });

  try {
    let chat = await Chat.findOne({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    }).populate("users", "-password");

    if (chat) return res.json(chat);

    chat = await Chat.create({
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    });

    const fullChat = await Chat.findById(chat._id).populate("users", "-password");
    res.status(201).json(fullChat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error creating chat" });
  }
};

// Send message
export const sendMessage = async (req, res) => {
  try {
    const { text, chatId } = req.body;
    if (!text || !chatId) return res.status(400).json({ message: "Missing fields" });

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    if (chat.isClosed) return res.status(403).json({ message: "Chat is closed" });

    const message = await Message.create({
      roomId: chat._id,
      sender: "user",
      text,
      status: "sent",
    });

    chat.latestMessage = message._id;
    await chat.save();

    res.status(201).json({ message, chat });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error sending message" });
  }
};

// Continue chat
export const continueChat = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid Chat ID" });

    const chat = await Chat.findById(id);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    chat.isClosed = false;
    await chat.save();

    res.json({ chat });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Close chat (admin only)
export const closeChat = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid Chat ID" });

    const chat = await Chat.findById(id);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    chat.isClosed = true;
    await chat.save();

    res.json({ chat });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
