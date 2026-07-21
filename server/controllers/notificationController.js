import { notificationIdSchema } from "../validators/notificationValidator.js";

import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../services/notificationService.js";

export const getAllNotifications = async (req, res) => {
  try {
    const notifications = await getNotifications();

    return res.status(200).json({
        success: true,
        data: {
            notifications,
        },
    });
  } catch (error) {
    console.error("Get Notifications Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications.",
    });
  }
};

export const getNotificationCount = async (req, res) => {
  try {
    const count = await getUnreadCount();

    return res.status(200).json({
        success: true,
        data: {
            count,
        },
    });
  } catch (error) {
    console.error("Unread Count Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch unread count.",
    });
  }
};

export const readNotification = async (req, res) => {
  try {
    const { id } = notificationIdSchema.parse(req.params);

    const notification = await markNotificationAsRead(id);

    return res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error("Read Notification Error:", error);

    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: error.errors[0].message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to mark notification as read.",
    });
  }
};

export const readAllNotifications = async (req, res) => {
  try {
    await markAllNotificationsAsRead();

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read.",
    });
  } catch (error) {
    console.error("Read All Notifications Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to mark all notifications as read.",
    });
  }
};