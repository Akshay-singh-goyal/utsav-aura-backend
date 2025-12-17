import mongoose from "mongoose";

const querySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: {
    type: String,
    enum: ["Pending", "Resolved"],
    default: "Pending",
  },
}, { timestamps: true });

const Query = mongoose.model("Query", querySchema);

export default Query;

