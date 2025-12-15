const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    batchId: { type: String, required: true },

    // ===== Registration Payment =====
    registrationFeePaid: { type: Boolean, default: false },
    registrationAmount: { type: Number, default: 200 }, // ₹200 registration
    registrationTransactionId: { type: String },

    // ===== Course Payment =====
    courseFeePaid: { type: Boolean, default: false },
    courseAmount: { type: Number, default: 2000 }, // ₹2000 course
    courseTransactionId: { type: String },

    // ===== Payment Type =====
    paymentType: { type: String, enum: ["paid", "unpaid"], required: true },

    // ===== Admin Approval =====
    adminApproved: { type: Boolean, default: false },

    // ===== Unpaid Flow: Test =====
    testSlot: Date,
    testScore: Number,

    // ===== General Transaction ID (optional for quick reference) =====
    transactionId: String,
  },
  { timestamps: true }
);

// Virtual to populate user info
registrationSchema.virtual("userInfo", {
  ref: "User",
  localField: "userId",
  foreignField: "_id",
  justOne: true,
});

registrationSchema.set("toJSON", { virtuals: true });
registrationSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Registration", registrationSchema);
