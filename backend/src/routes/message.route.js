import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getMessages,
  getUsersForSidebar,
  sendMessage,
  deleteMessage,
  editMessage,
  updateMessageStatus,
  getAllMessages,
} from "../contollers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);
router.get("/", protectRoute, getAllMessages);
router.post("/send/:id", protectRoute, sendMessage);
router.delete("/:id", protectRoute, deleteMessage);
router.post("/edit/:id", protectRoute, editMessage);
router.post("/edit", protectRoute, updateMessageStatus);

export default router;
