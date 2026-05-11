import axios from "axios";
import { apiInterceptors } from "@/shared/api/interceptors";

// ========== API CLIENT ==========

export const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// ========== Interceptors ==========

apiInterceptors.attach(apiClient);
