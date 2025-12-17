import express from "express";
import {
  signup,
  login,
  forgotPassword,
  resetPassword,
  me,
  getUsers,
} from "../Controllers/authController.js";
import { addProduct } from "../Controllers/ProductController.js";
import { signupValidation, loginValidation } from "../Middlewares/AuthValidation.js";
import { requireAuth, requireAdmin } from "../Middlewares/Auth.js";

const router = express.Router();

// --- Public routes ---
router.post("/signup", signupValidation, signup);
router.post("/login", loginValidation, login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// --- Protected routes ---
router.get("/me", requireAuth, me); // user profile
router.get("/getusers", requireAuth, requireAdmin, getUsers); // admin only

// --- Admin product route ---
router.post("/products", requireAuth, requireAdmin, addProduct);

export default router;
