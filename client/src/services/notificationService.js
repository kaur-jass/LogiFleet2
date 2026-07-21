import API from "../api/axios";

export const getNotifications = async () => {
  return API.get("/notifications").then((res) => res.data);
};

export const getUnreadNotificationCount = async () => {
  return API.get("/notifications/unread-count").then(
    (res) => res.data
  );
};

export const markNotificationAsRead = async (id) => {
  return API.patch(`/notifications/${id}/read`).then(
    (res) => res.data
  );
};

export const markAllNotificationsAsRead = async () => {
  return API.patch("/notifications/read-all").then(
    (res) => res.data
  );
};