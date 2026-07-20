import { Router } from "express";

import {
  getAllNotifications,
  getNotificationCount,
  readNotification,
  readAllNotifications,
} from "../controllers/notificationController.js";

const router = Router();

router.get("/", getAllNotifications);

router.get("/unread-count", getNotificationCount);

router.patch("/:id/read", readNotification);

router.patch("/read-all", readAllNotifications);

export default router;