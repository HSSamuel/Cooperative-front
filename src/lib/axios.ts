// frontend/src/lib/axios.ts
import axios from "axios";

const apiClient = axios.create({
  // Automatically prepends the base URL to all requests
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  // CRITICAL: Instructs Axios to always send/receive HttpOnly cookies
  withCredentials: true,
});

export default apiClient;
