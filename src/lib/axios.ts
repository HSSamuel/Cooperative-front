import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

// Intercept responses to handle global 401 Unauthorized errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear orphaned local storage
      if (typeof window !== "undefined") {
        localStorage.removeItem("coop_user");
        // Forcefully redirect to login
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
