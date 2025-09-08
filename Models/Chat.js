// backend/models/Chat.js
import mongoose from "mongoose";

// Message sub-schema
const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      enum: ["user", "admin"],
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true } // ensures each message has its own unique _id
);

// Chat schema
const chatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messages: [messageSchema],
    isClosed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ✅ Only compile the model if it hasn't been compiled yet
const Chat = mongoose.models.Chat || mongoose.model("Chat", chatSchema);

export default Chat;
