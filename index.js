// ----------------------
// server.js
// ----------------------
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import http from "http";
import { Server } from "socket.io";
import fetch from "node-fetch";

// --- Load env vars ---
dotenv.config();

// --- Fix __dirname for ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Ensure uploads folder exists ---
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// --- Import routes ---
import authRoutes from "./Routes/AuthRouter.js";
import dashboardRoutes from "./Routes/dashboard.routes.js";
import productRoutes from "./Routes/product.routes.js";
import orderRoutes from "./Routes/orderRoutes.js";
import liveRoutes from "./Routes/liveRoutes.js";
import decorationRoutes from "./Routes/decorationRoutes.js";
import categoryRoute from "./Routes/categoryRotue.js";
import packageRoutes from "./Routes/packageRoutes.js";
import queryRoutes from "./Routes/queryRoutes.js";
import profileRoutes from "./Routes/profileRoutes.js";

// --- Config ---
const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI not defined in environment variables!");
  process.exit(1);
}

// --- Allowed origins (dev + prod) ---
const allowedOrigins = [
  "http://localhost:3000",
  "https://utsav-aura.vercel.app",
];

// --- Middleware ---
app.use(helmet());
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static(uploadDir));

// --- Routes ---
app.use("/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/live", liveRoutes);
app.use("/api/admin/decorations", decorationRoutes);
app.use("/api/admin/category", categoryRoute);
app.use("/api/packages", packageRoutes);
app.use("/api/queries", queryRoutes);
app.use("/api/profile", profileRoutes);

// --- Health check ---
app.get("/", (_, res) => res.json({ message: "Server running ✅" }));
app.get("/ping", (_, res) => res.send("PONG 🏓"));

// --- YouTube API Routes ---
const youtubeRouter = express.Router();

// Channel statistics
youtubeRouter.get("/youtube-stats", async (req, res) => {
  try {
    const { YT_API_KEY, YT_CHANNEL_ID } = process.env;
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${YT_CHANNEL_ID}&key=${YT_API_KEY}`
    );

    if (!response.ok) return res.status(response.status).json({ error: "YouTube API error" });

    const data = await response.json();
    res.json(data.items[0].statistics);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch YouTube stats" });
  }
});

// Live chat ID
youtubeRouter.get("/youtube-live-chat-id", async (req, res) => {
  try {
    const { YT_API_KEY, YT_VIDEO_ID } = process.env;
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${YT_VIDEO_ID}&key=${YT_API_KEY}`
    );

    if (!response.ok) return res.status(response.status).json({ error: "YouTube API error" });

    const data = await response.json();
    const liveChatId = data.items[0]?.liveStreamingDetails?.activeLiveChatId;

    if (!liveChatId) return res.status(404).json({ error: "Live chat not found" });

    res.json({ liveChatId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch live chat ID" });
  }
});

app.use("/api/misc", youtubeRouter);

// --- 404 handler ---
app.use((req, res) => res.status(404).json({ error: "Route not found" }));

// --- Global error handler ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

// --- HTTP Server + Socket.IO ---
const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("✅ Socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});

// Utility: broadcast order updates
export const emitOrderUpdate = (order) => io.emit("orderUpdated", order);

// --- Start server after DB connects ---
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected ✅");
    server.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed", err);
    process.exit(1);
  });
