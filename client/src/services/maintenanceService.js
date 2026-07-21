import API from "../api/axios";

export const getMaintenanceLogs = (params) => API.get("/maintenance", { params });
export const createMaintenance = (data) => API.post("/maintenance", data);
export const closeMaintenance = (id) => API.patch(`/maintenance/${id}/close`);