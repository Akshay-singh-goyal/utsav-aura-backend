// backend/Middlewares/Auth.js
import jwt from "jsonwebtoken";
import User from "../Models/User.js";

/**
 * Verify JWT Token and attach user to request
 */
export const verifyUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

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
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    req.user = user; // Attach user to request
    next();
  } catch (err) {
    console.error("verifyUser error:", err.message);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};
// middlewares/Auth.js
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // support both {id} and {_id}
    const userId = decoded.id || decoded._id;

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("verifyToken error", err);
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

/**
 * Verify Admin Role (requires verifyUser first)
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
 * Shortcuts for routes
 */
export const requireAuth = verifyUser;
export const requireAdmin = [verifyUser, verifyAdmin];
