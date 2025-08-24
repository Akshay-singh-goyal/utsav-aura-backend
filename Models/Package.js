import mongoose from "mongoose";

const packageSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ["Basic", "Standard", "Premium"],
    required: true,
  },
  description: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  duration: { type: Number, required: true, min: 1 },
  days: [
    {
      dayNumber: { type: Number, required: true },
      items: [{ type: String, required: true }],
    },
  ],
  image: { type: String, required: true }, // ✅ Added
  createdAt: { type: Date, default: Date.now },
});

const Package = mongoose.model("Package", packageSchema);
export default Package;
