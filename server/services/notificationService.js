import prisma from "../lib/prisma.js";

export const createNotification = async ({
  title,
  message,
  type,
  priority = "MEDIUM",
  actionUrl = null,
  entityId = null,
}) => {
  return prisma.notification.create({
    data: {
      title,
      message,
      type,
      priority,
      actionUrl,
      entityId,
    },
  });
};

export const getNotifications = async () => {
  return prisma.notification.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getUnreadCount = async () => {
  return prisma.notification.count({
    where: {
      isRead: false,
    },
  });
};

export const markNotificationAsRead = async (id) => {
  return prisma.notification.update({
    where: {
      id,
    },
    data: {
      isRead: true,
    },
  });
};

export const markAllNotificationsAsRead = async () => {
  return prisma.notification.updateMany({
    where: {
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });
};