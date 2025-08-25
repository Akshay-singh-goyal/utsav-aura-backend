import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    originalPrice: { type: Number, required: true }, // MRP
    discountPrice: { type: Number, required: true }, // Final Price
    description: { type: String, required: true },
    category: { type: String, required: true },
    quantity: { type: Number, default: 0 },
    color: { type: String },
    soldBy: { type: String },
    image: { type: String }, // uploaded path / URL
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
