import Registration from "../models/Registration.js";
import User from "../models/User.js";

// Register batch
export const registerBatch = async (req, res) => {
  try {
    const { batchId, paymentMethod, transactionId } = req.body;

    // Get user info from JWT middleware
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if already registered
    const existing = await Registration.findOne({ batchId, userId: user._id });
    if (existing)
      return res.status(400).json({ message: "Already registered for this batch" });

    const registration = new Registration({
      batchId,
      userId: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      paymentMethod,
      transactionId: paymentMethod === "paid" ? transactionId : null,
    });

    await registration.save();
    res
      .status(201)
      .json({ message: "Registration successful! Await admin confirmation." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
