const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendOtp = require("../utils/sendOtp");

// TEMP OTP STORE
let otpStore = {};

/**
 * Send OTP for mobile/email verification
 */
exports.sendOtp = async (req, res) => {
  try {
    const { name, email, mobile } = req.body;

    if (!email && !mobile) {
      return res.status(400).json({ message: "Email or Mobile is required" });
    }

    const key = email || mobile;

    const otp = Math.floor(1000 + Math.random() * 9000); // 4-digit OTP

    otpStore[key] = {
      otp,
      expires: Date.now() + 10 * 60 * 1000, // 10 minutes expiry
    };

    console.log("Generated OTP for", key, ":", otp);

    await sendOtp(email || mobile, otp, name || "User");

    res.json({ message: "OTP sent successfully!" });
  } catch (err) {
    console.error("OTP Sending Error:", err);
    res.status(500).json({ message: "OTP sending failed", error: err.message });
  }
};

/**
 * Verify OTP
 */
exports.verifyOtp = async (req, res) => {
  try {
    const { email, mobile, otp } = req.body;

    const key = email || mobile;

    if (!otpStore[key]) {
      return res.status(400).json({ message: "OTP not requested" });
    }

    if (otpStore[key].otp != otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (Date.now() > otpStore[key].expires) {
      return res.status(400).json({ message: "OTP expired" });
    }

    delete otpStore[key];

    res.json({ message: "OTP verified successfully!" });
  } catch (err) {
    console.error("OTP Verify Error:", err);
    res.status(500).json({ message: "OTP verification failed" });
  }
};

/**
 * User Registration
 */
exports.register = async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    if (!name || !password || (!email && !mobile)) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      mobile,
      password: hashedPassword,
    });

    res.json({ message: "Registration successful!", user });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
};

/**
 * Login with Email or Mobile
 */
exports.login = async (req, res) => {
  try {
    const { email, mobile, password } = req.body;

    if (!email && !mobile) {
      return res.status(400).json({ message: "Email or Mobile is required" });
    }

    const user = await User.findOne(email ? { email } : { mobile });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Password-based login
    if (password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Incorrect password" });
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user,
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};
