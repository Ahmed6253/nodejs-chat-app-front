import axios from "axios";

export  const BASE_URL = "http://localhost:5001";

export const axiosInstance = axios.create({
  baseURL: BASE_URL + "/api",
  withCredentials: true,
});
