import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: any[] = [];

// Helper to process paused requests once the token is refreshed
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("coop_token_raw");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 1. Zod Validation Error Handling
    if (error.response?.status === 400 && error.response.data?.errors) {
      error.response.data.message = error.response.data.errors[0];
    }

    // 2. Token Refresh Logic
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Prevent infinite loops on the refresh endpoint itself
      if (originalRequest.url.includes("/auth/refresh")) {
        return handleHardLogout(error);
      }

      if (isRefreshing) {
        // If a refresh is already happening, queue this request until it finishes
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Silently request a new access token
        const { data } = await axios.post(
          `${apiClient.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        if (typeof window !== "undefined") {
          localStorage.setItem("coop_token_raw", data.token);
        }

        // Apply new token to the original failed request
        originalRequest.headers.Authorization = `Bearer ${data.token}`;

        processQueue(null, data.token);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        return handleHardLogout(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// Utility to completely wipe the session if the refresh token is dead
const handleHardLogout = (error: any) => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("coop_user");
    localStorage.removeItem("coop_token_raw");
    window.location.href = "/login";
  }
  return Promise.reject(error);
};

export default apiClient;
