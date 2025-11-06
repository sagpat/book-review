// api.js
import axios from "axios";
import CryptoJS from "crypto-js";

const API_URL =  import.meta.env.VITE_REACT_APP_API_URL;
const ENCRYPTION_KEY =  import.meta.env.VITE_REACT_APP_ENCRYPTION_KEY || "";
const API_KEY =  import.meta.env.VITE_BOOK_APP_BE_MS_API_KEY || "";

const api = axios.create({
  baseURL: API_URL,
});

// Function to encrypt the API key
const encryptApiKey = () => {
  return CryptoJS.AES.encrypt(API_KEY, ENCRYPTION_KEY, CryptoJS.enc.Utf8).toString();
};

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const apiRequest = async (
    method: string,
    endpoint: string,
    data?: object,
    token?: string | null
) => {
  console.log("apiRequest::::", method, endpoint, data);
  try {
    const response = await api({
      method,
      url: `${API_URL}${endpoint}`,
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
    console.log("response::::", response);
    return response.data;
  } catch (error) {
    console.error(
      `Error making ${method} request to ${endpoint}:`,
      error
    );
    throw error;
  }
};
