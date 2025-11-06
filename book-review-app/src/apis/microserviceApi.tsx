// microserviceApi.tsx
import axios from "axios";
import CryptoJS from "crypto-js";

const MICROSERVICE_API_URL = import.meta.env.VITE_MICROSERVICE_API_URL || "http://localhost:3002/api";
const ENCRYPTION_KEY = import.meta.env.VITE_REACT_APP_ENCRYPTION_KEY || "";
const API_KEY = import.meta.env.VITE_BOOK_APP_BE_MS_API_KEY || "";

const microserviceApi = axios.create({
  baseURL: MICROSERVICE_API_URL,
});

// Function to encrypt the API key
const encryptApiKey = () => {
  return CryptoJS.AES.encrypt(API_KEY, ENCRYPTION_KEY, CryptoJS.enc.Utf8).toString();
};

// Response interceptor
microserviceApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const microserviceRequest = async (
    method: string,
    endpoint: string,
    data?: object,
    token?: string | null
) => {
  console.log("microserviceRequest::::", method, endpoint, data);
  try {
    const response = await microserviceApi({
      method,
      url: endpoint,
      data,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-api-key": encryptApiKey(),
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
    console.log("microservice response::::", response);
    return response.data;
  } catch (error) {
    console.error(
      `Error making ${method} request to microservice ${endpoint}:`,
      error
    );
    throw error;
  }
};

// Recommendations API
export const recommendationsApi = {
  getUserRecommendations: (userId: string, limit?: number, token?: string) =>
    microserviceRequest("GET", `/recommendations/user/${userId}${limit ? `?limit=${limit}` : ''}`, undefined, token),
  
  getSimilarBooks: (bookId: string, token?: string) =>
    microserviceRequest("GET", `/recommendations/similar/${bookId}`, undefined, token),
  
  getTrendingBooks: (token?: string) =>
    microserviceRequest("GET", "/recommendations/trending", undefined, token),
};

// Analytics API
export const analyticsApi = {
  getPopularBooks: (token?: string) =>
    microserviceRequest("GET", "/analytics/books/popular", undefined, token),
  
  getUserActivity: (token?: string) =>
    microserviceRequest("GET", "/analytics/users/activity", undefined, token),
  
  getReviewStats: (token?: string) =>
    microserviceRequest("GET", "/analytics/reviews/stats", undefined, token),
};

// Search API
export const searchApi = {
  searchBooks: (query: string, token?: string) =>
    microserviceRequest("GET", `/search/books?q=${encodeURIComponent(query)}`, undefined, token),
  
  advancedSearch: (filters: any, token?: string) =>
    microserviceRequest("POST", "/search/advanced", filters, token),
};

// Notifications API
export const notificationsApi = {
  getUserNotifications: (userId: string, token?: string) =>
    microserviceRequest("GET", `/notifications/user/${userId}`, undefined, token),
  
  markAsRead: (notificationId: string, token?: string) =>
    microserviceRequest("PUT", `/notifications/${notificationId}/read`, undefined, token),
  
  getUnreadCount: (userId: string, token?: string) =>
    microserviceRequest("GET", `/notifications/user/${userId}/unread-count`, undefined, token),
};