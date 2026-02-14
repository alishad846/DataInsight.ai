import express from "express";
import { askQuestion } from "../controllers/chatController.js";

const router = express.Router();

router.post("/chat", askQuestion);

export default router;
