import mongoose from "mongoose";

const LiveSessionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  youtubeLink: { type: String, required: true },
  poster: { type: String },
  status: { type: String, enum: ["upcoming", "live", "ended"], default: "upcoming" },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
}, { timestamps: true });

// Export as default
const LiveSession = mongoose.model("LiveSession", LiveSessionSchema);
export default LiveSession;
