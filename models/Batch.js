import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
    // USER
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // BATCH
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },

    // Language or Course Name (C, C++, Java, MERN, etc.)
    courseName: {
      type: String,
      required: true,
    },

    // PAID or UNPAID
    paymentMethod: {
      type: String,
      enum: ["paid", "unpaid"],
      required: true,
    },

    // PAYMENT DETAILS (For paid users)
    registrationFee: {
      type: Number,
      default: 0,
    },
    courseFee: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },

    transactionId: {
      type: String,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },

    paymentScreenshot: {
      type: String, // Image URL
    },

    paymentDate: {
      type: Date,
    },

    amountPaid: {
      type: Number,
      default: 0,
    },

    // FOR UNPAID USERS
    unpaidSlot: {
      type: Date,
    },

    testScore: {
      type: Number,
    },

    // ADMIN APPROVAL SYSTEM
    interviewApproved: {
      type: Boolean,
      default: false,
    },

    registrationConfirmed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Registration", registrationSchema);
