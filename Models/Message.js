import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
    sender: { type: String, enum: ["user", "admin"], required: true },
    text: { type: String, required: true },
    status: { type: String, enum: ["sent", "delivered", "read"], default: "sent" },
  },
  { timestamps: true }
);

const Message = mongoose.models.Message || mongoose.model("Message", messageSchema);
export default Message;
