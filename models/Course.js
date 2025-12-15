const mongoose = require('mongoose');

const LectureSchema = new mongoose.Schema({
  title: String,
  videoUrl: String,
  notesUrl: String,
  duration: Number,
  order: Number
});

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, lowercase: true, unique: true },
  description: String,
  price: { type: Number, default: 0 },
  isFree: { type: Boolean, default: false },
  thumbnail: String,
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lectures: [LectureSchema],
  category: String,
  tags: [String],
  rating: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Course', CourseSchema);
