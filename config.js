import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT || 5000;
export const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/SKART";
export const JWT_SECRET = process.env.JWT_SECRET || "supersecret-change-me";
export const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "https://utsav-aura.vercel.app/";
