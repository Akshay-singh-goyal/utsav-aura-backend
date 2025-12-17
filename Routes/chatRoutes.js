import express from "express";
import {
  getMyChat,
  createChat,
  sendMessage,
  continueChat,
  closeChat,
} from "../Controllers/chatController.js";
import { requireAuth, requireAdmin } from "../Middlewares/Auth.js";

const router = express.Router();

router.get("/me", requireAuth, getMyChat);
router.post("/", requireAuth, createChat);
router.post("/send", requireAuth, sendMessage);
router.post("/:id/continue", requireAuth, continueChat);
router.post("/:id/close", requireAuth, requireAdmin, closeChat);

export default router;
