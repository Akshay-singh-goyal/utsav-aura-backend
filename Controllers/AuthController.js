import bcrypt from "bcryptjs";  // use bcryptjs for ESM compatibility
import jwt from "jsonwebtoken";
import UserModel from "../Models/User.js";
import Product from "../Models/Product.js";

// Set your admin secret key as a string or use environment variable
const ADMIN_SECRET = process.env.ADMIN_SECRET || "SKART@123"; // 🔹 string literal

// --- Signup ---
export const signup = async (req, res) => {
  try {
    const { name, email, password, role, adminKey } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Admin role check
    if (role === "admin" && adminKey !== ADMIN_SECRET) {
      return res.status(403).json({ success: false, message: "Invalid admin secret key" });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new UserModel({ name, email, password: hashedPassword, role });
    await user.save();

    res.status(201).json({
      success: true,
      message: "Signup successful",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Signup Error:", err.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// --- Login ---
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await UserModel.findOne({ email });
    if (!user) return res.status(403).json({ success: false, message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(403).json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// --- Get logged-in user ---
export const me = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    res.json({ success: true, user: req.user });
  } catch (err) {
    console.error("Me Error:", err.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// --- Admin: Add product ---
export const addProduct = async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const product = new Product({ name, description, price });
    await product.save();
    res.json({ success: true, message: "Product added successfully", product });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error adding product" });
  }
};

// --- Admin: Get all users ---
export const getUsers = async (req, res) => {
  try {
    const users = await UserModel.find({}, "-password"); // exclude password
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching users", error: err.message });
  }
};
