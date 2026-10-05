import axios from "axios";
import { BASE_BACKEND_URL } from "./constant";

const axiosInstance = axios.create({
    baseURL: BASE_BACKEND_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Request Interceptor: Attach JWT Token
axiosInstance.interceptors.request.use(
    (config) => {
        try {
            const accessToken = localStorage.getItem("token");
            if (accessToken) {
                config.headers.Authorization = `Bearer ${accessToken}`;
            }
        } catch (e) {
            console.error("Error accessing localStorage in request interceptor:", e);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Centralized Error Parsing and Session Expiry
axiosInstance.interceptors.response.use(
    (response) => {
        // Return successful response as-is
        return response;
    },
    (error) => {
        let friendlyMessage = "Something went wrong. Please try again.";
        const status = error.response ? error.response.status : null;
        const backendMessage = error.response?.data?.message;
        const backendErrors = error.response?.data?.errors;

        if (!error.response) {
            if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
                friendlyMessage = "Connection timed out. The server is taking too long to respond.";
            } else {
                friendlyMessage = "Unable to connect to the server. Please check your internet connection.";
            }
        } else {
            // Determine friendly message according to HTTP status code
            switch (status) {
                case 400:
                    friendlyMessage = backendMessage || "Invalid request. Please check the entered data.";
                    break;
                case 401:
                    friendlyMessage = backendMessage || "Session expired or unauthorized. Please log in again.";
                    try {
                        localStorage.removeItem("token");
                        localStorage.removeItem("persist:root");
                    } catch (e) {
                        console.error(e);
                    }
                    // If not on login/signup page, redirect to login
                    if (typeof window !== 'undefined' && 
                        window.location.pathname !== '/' && 
                        window.location.pathname !== '/sign-up') {
                        setTimeout(() => {
                            window.location.href = '/';
                        }, 1200);
                    }
                    break;
                case 403:
                    friendlyMessage = backendMessage || "You do not have permission to perform this action.";
                    break;
                case 404:
                    friendlyMessage = backendMessage || "The requested resource was not found.";
                    break;
                case 409:
                    friendlyMessage = backendMessage || "A conflict occurred with the existing data.";
                    break;
                case 422:
                    friendlyMessage = backendMessage || "Validation failed. Please verify your inputs.";
                    break;
                case 500:
                case 502:
                case 503:
                    friendlyMessage = "Internal server error. Our team has been notified.";
                    break;
                default:
                    friendlyMessage = backendMessage || `Unexpected error occurred (Code: ${status}).`;
            }
        }

        // Create normalized error object
        const normalizedError = new Error(friendlyMessage);
        normalizedError.status = status;
        normalizedError.statusCode = status;
        normalizedError.friendlyMessage = friendlyMessage;
        normalizedError.errors = Array.isArray(backendErrors) ? backendErrors : [];
        normalizedError.originalError = error;

        return Promise.reject(normalizedError);
    }
);

export default axiosInstance;