import API from "../api/axios";

export const getDrivers = (params) => API.get("/drivers", { params });
export const createDriver = (data) => API.post("/drivers", data);
export const updateDriver = (id, data) => API.patch(`/drivers/${id}`, data);
export const getAvailableDrivers = () => API.get("/drivers/available");
export const getDriverById = (id) => API.get(`/drivers/${id}`);