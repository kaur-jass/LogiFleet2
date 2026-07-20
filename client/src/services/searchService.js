import API from "../api/axios";

export const globalSearch = async (query) => {
  const response = await API.get(`/search?q=${encodeURIComponent(query)}`);
  return response.data.data;
};