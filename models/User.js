const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },

  email: { type: String, required: true, unique: true, sparse: true },

  mobile: { type: String, unique: true, sparse: true },

  password: { type: String, required: true }, // hashed

  role: {
    type: String,
    enum: ["student", "teacher", "admin"],
    default: "student",
  },

  // Auto Avatar (Dicebear)
  avatar: {
    type: String,
    default: function () {
      return `https://api.dicebear.com/8.x/bottts/svg?seed=${this.name}`;
    },
  },

  completedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],

  purchasedBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],

  downloadHistory: [
    {
      fileId: String,
      title: String,
      date: { type: Date, default: Date.now },
    },
  ],

  savedNotes: [
    {
      title: String,
      url: String,
    },
  ],

  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],

  paymentHistory: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
  ],

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);
