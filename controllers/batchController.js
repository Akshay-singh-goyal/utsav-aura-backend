// controllers/batchController.js
const Batch = require("../models/Batch");
const Registration = require("../models/Registration");
const { sendMail } = require("../utils/mailer");

exports.getBatch = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) return res.status(404).json({ message: "Batch not found" });
    res.json(batch);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Create registration (user pays registration fee & enters txn id)
exports.registerForBatch = async (req, res) => {
  try {
    const { name, email, userId, transactionId, paymentMethod } = req.body;
    const batch = await Batch.findById(req.params.id);
    if (!batch) return res.status(404).json({ message: "Batch not found" });

    // Expected registration amount
    const regAmount = batch.registrationFee || 200;

    const registration = await Registration.create({
      batch: batch._id,
      userId,
      userName: name,
      userEmail: email,
      transactionId,
      amountPaid: regAmount,
      status: "awaiting_payment", // awaiting admin confirmation
    });

    // Email admin about new registration
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      const subject = `New Registration: ${batch.title}`;
      const html = `
        <p>New registration for batch: <strong>${batch.title}</strong></p>
        <p>User: ${name} (${email})</p>
        <p>Registration amount: ₹${regAmount}</p>
        <p>Transaction ID: ${transactionId}</p>
        <p><a href="${process.env.APP_URL || ""}/admin/registrations/${registration._id}">View registration</a></p>
      `;
      await sendMail({ to: adminEmail, subject, html });
    }

    res.json({ message: "Registration submitted. Awaiting admin confirmation.", registration });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
};

// Admin confirms registration — then send email to user asking to pay course fee
exports.confirmRegistration = async (req, res) => {
  try {
    const { regId } = req.params;
    const { adminNote } = req.body;
    const reg = await Registration.findById(regId).populate("batch");
    if (!reg) return res.status(404).json({ message: "Registration not found" });

    reg.status = "confirmed";
    reg.adminNote = adminNote || "";
    await reg.save();

    // send email to user
    if (reg.userEmail) {
      const subject = `Your seat is confirmed for ${reg.batch.title}`;
      const html = `
        <p>Hi ${reg.userName || ""},</p>
        <p>Your registration (₹${reg.amountPaid}) is confirmed by admin for batch: <strong>${reg.batch.title}</strong>.</p>
        <p>Now please complete the course fee payment of ₹${reg.batch.courseFee}.</p>
        <p>Payment instructions: Scan QR or visit payment page: <a href="${process.env.APP_URL || ""}/pay/${reg._id}">Pay Now</a></p>
      `;
      await sendMail({ to: reg.userEmail, subject, html });
    }

    res.json({ message: "Registration confirmed and user notified", reg });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Confirm failed", error: err.message });
  }
};

// Admin list registrations (basic)
exports.listRegistrations = async (req, res) => {
  try {
    const regs = await Registration.find().populate("batch").sort({ createdAt: -1 });
    res.json(regs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed", error: err.message });
  }
};
