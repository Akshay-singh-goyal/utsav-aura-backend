const express = require("express");
const router = express.Router();
const Registration = require("../models/Registration");

// Approve registration
router.post("/approve/:regId", async (req, res) => {
  const reg = await Registration.findById(req.params.regId);
  if (!reg) return res.status(404).json({ message: "Registration not found" });

  reg.adminApproved = true;
  await reg.save();

  res.json({ message: "Admin approved registration", registration: reg });
});

// Confirm course payment
router.post("/course-pay/:regId", async (req, res) => {
  const reg = await Registration.findById(req.params.regId);
  if (!reg) return res.status(404).json({ message: "Registration not found" });

  reg.courseFeePaid = true;
  await reg.save();

  res.json({ message: "Course payment confirmed", registration: reg });
});

module.exports = router;
