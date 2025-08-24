// models/Decoration.js
import mongoose from 'mongoose';

const decorationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String, // URL or file path to the image
    required: true,
  },
  priceBuy: {
    type: Number,
    required: true,
  },
  priceRent: {
    type: Number,
    required: true,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const Decoration = mongoose.model('Decoration', decorationSchema);

export default Decoration;
