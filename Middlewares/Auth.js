// backend/Middlewares/Auth.js
import jwt from "jsonwebtoken";
import User from "../Models/User.js";

/**
 * Verify JWT Token for any logged-in user
 */
export const verifyUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.id) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    // Fetch user from DB excluding password
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    req.user = user; // Attach user to request
    next();
  } catch (err) {
    console.error("verifyUser error:", err.message);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

/**
 * Verify Admin Role
 */
export const verifyAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized: User not found" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Forbidden: Admins only" });
  }

  next();
};

/**
 * Shortcut for routes that require login only
 */
export const requireAuth = verifyUser;

/**
 * Shortcut for routes that require admin
 */
export const requireAdmin = [verifyUser, verifyAdmin];

/**
 * Legacy authMiddleware (optional, if you still need it)
 */
export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ success: false, message: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};
