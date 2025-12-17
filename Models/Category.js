// Models/Category.js
import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);

// 👇 This makes it a default export
export default Category;
