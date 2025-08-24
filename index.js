import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import http from "http";
import { Server } from "socket.io";
import fetch from 'node-fetch'; // Make sure node-fetch is installed

// --- Load environment variables ---
dotenv.config();

// --- Fix __dirname for ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Ensure uploads folder exists ---
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// --- Import routes ---
import authRoutes from './Routes/AuthRouter.js';
import dashboardRoutes from './Routes/dashboard.routes.js';
import productRoutes from './Routes/product.routes.js';
import orderRoutes from './Routes/orderRoutes.js';
import liveRoutes from './Routes/liveRoutes.js';
import decorationRoutes from './Routes/decorationRoutes.js';
import categoryRoute from './Routes/categoryRotue.js';
import packageRoutes from "./Routes/packageRoutes.js";
import queryRoutes from "./Routes/queryRoutes.js";
import profileRoutes from "./Routes/profileRoutes.js";


// --- App & Config ---
const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/SKART';

// --- Middleware ---
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000', credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(uploadDir));

// --- Routes ---
app.use('/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/live', liveRoutes);
app.use('/api/admin/decorations', decorationRoutes);
app.use('/api/admin/category', categoryRoute);
app.use("/api/packages", packageRoutes);
app.use("/api/queries", queryRoutes);
app.use("/api/profile", profileRoutes);

// --- Health Check ---
app.get('/', (_, res) => res.json({ message: 'Server running ✅' }));
app.get('/ping', (_, res) => res.send('PONG 🏓'));

// --- YouTube API Routes ---
const youtubeRouter = express.Router();

// Channel statistics
youtubeRouter.get("/youtube-stats", async (req, res) => {
  try {
    const API_KEY = process.env.YT_API_KEY;
    const CHANNEL_ID = process.env.YT_CHANNEL_ID;

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${CHANNEL_ID}&key=${API_KEY}`
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
    const API_KEY = process.env.YT_API_KEY;
    const VIDEO_ID = process.env.YT_VIDEO_ID;

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${VIDEO_ID}&key=${API_KEY}`
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

app.use('/api/misc', youtubeRouter);

// --- 404 handler ---
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// --- Global error handler ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// --- HTTP server + Socket.IO ---
const server = http.createServer(app);
export const io = new Server(server, { cors: { origin: process.env.FRONTEND_ORIGIN || "http://localhost:3000" } });

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
  socket.on("disconnect", () => console.log("Socket disconnected:", socket.id));
});

// Emit order updates helper
export const emitOrderUpdate = (order) => io.emit("orderUpdated", order);

// --- MongoDB connection + server start ---
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected ✅');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection failed ❌', err);
    process.exit(1);
  });
