import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true,
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
