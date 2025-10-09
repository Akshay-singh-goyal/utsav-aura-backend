import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    isGroupChat: { type: Boolean, default: false },
    chatName: { type: String, trim: true },
    latestMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    isClosed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Chat = mongoose.models.Chat || mongoose.model("Chat", chatSchema);
export default Chat;
