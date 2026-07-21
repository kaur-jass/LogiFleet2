import API from "../api/axios";

export const getVehicles = (params) => API.get("/vehicles", { params });
export const createVehicle = (data) => API.post("/vehicles", data);
export const updateVehicle = (id, data) => API.patch(`/vehicles/${id}`, data);
export const deleteVehicle = (id) => API.delete(`/vehicles/${id}`);
export const getAvailableVehicles = () => API.get("/vehicles/available");
export const getVehicleById = (id) => API.get(`/vehicles/${id}`);