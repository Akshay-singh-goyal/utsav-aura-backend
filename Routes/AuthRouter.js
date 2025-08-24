import express from "express";
import { signup, login, me, getUsers } from "../Controllers/AuthController.js";
import { signupValidation, loginValidation } from "../Middlewares/AuthValidation.js";
import { requireAuth, requireAdmin } from "../Middlewares/Auth.js";
import { addProduct } from "../Controllers/ProductController.js";

const router = express.Router();

// --- Public routes ---
router.post("/login", loginValidation, login);
router.post("/signup", signupValidation, signup);

// --- Protected routes ---
router.get("/me", requireAuth, me);           // user profile
router.get("/getusers", requireAuth, requireAdmin, getUsers); // admin only

// --- Admin product route ---
router.post("/products", requireAuth, requireAdmin, addProduct);

export default router;
