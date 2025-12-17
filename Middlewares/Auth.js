// backend/middlewares/Auth.js
import jwt from "jsonwebtoken";
import User from "../Models/User.js";

/**
 * Verify JWT Token and attach user to request
 */
export const verifyUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ success: false, message: "Unauthorized" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id); // Make sure your User model uses _id
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    req.user = user; // attach user to request
    next();
  } catch (err) {
    console.error("verifyUser error:", err);
    res.status(401).json({ success: false, message: "Token invalid or expired" });
  }
};
/**
 * Verify Admin Role (requires verifyUser first)
 */
export const verifyAdmin = (req, res, next) => {
  if (!req.user) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized: User not found" });
  }

  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ success: false, message: "Forbidden: Admins only" });
  }

  next();
};

/**
 * Route Shortcuts
 */
export const requireAuth = verifyUser; // For protected routes
export const requireAdmin = [verifyUser, verifyAdmin]; // For admin routes
