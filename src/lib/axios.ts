import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true, // Still useful if you eventually switch to a unified custom domain
});

// 🚀 NEW: Intercept requests to attach the Bearer token manually
// This bypasses the Third-Party Cookie block when Netlify communicates with Render
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    // Attempt to grab the raw token from localStorage
    const token = localStorage.getItem("coop_token_raw");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Intercept responses to handle global 401 Unauthorized errors and Zod validations
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // 1. Handle Session Expiration
      if (error.response.status === 401) {
        // Clear orphaned local storage
        if (typeof window !== "undefined") {
          localStorage.removeItem("coop_user");
          localStorage.removeItem("coop_token_raw"); // Clear the raw token as well
          // Forcefully redirect to login
          window.location.href = "/login";
        }
      }

      // 2. 🚀 Handle Zod Schema Validation Errors
      // Maps the detailed Zod error array into the main message property
      // so the frontend toast notifications display the exact field failure seamlessly.
      if (error.response.status === 400 && error.response.data?.errors) {
        // We extract the first, most relevant validation error to show to the user
        error.response.data.message = error.response.data.errors[0];
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
