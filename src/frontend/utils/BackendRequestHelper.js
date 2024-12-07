// utils/BackendRequestHelper.js

import axios from "axios";
import { auth } from "../../firebase";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Utility to get the Firebase token
const getToken = async () => {
  const currentUser = auth.currentUser;
  if (currentUser) {
    // Force refresh the token
    const token = await currentUser.getIdToken(true); // true forces a token refresh
    return token;
  }
  return null;
};

// Utility function for GET requests
export const getData = async (endpoint) => {
  const token = await getToken();
  try {
    const response = await api.get(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error(`GET ${endpoint} failed:`, error);
    throw error.response ? error.response.data : error;
  }
};

// Utility function for POST requests
export const postData = async (endpoint, payload) => {
  const token = await getToken();
  try {
    const response = await api.post(endpoint, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error(`POST ${endpoint} failed:`, error);
    throw error.response ? error.response.data : error;
  }
};

// Utility function for PUT requests
export const putData = async (endpoint, payload) => {
  const token = await getToken();
  try {
    const response = await api.put(endpoint, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error(`PUT ${endpoint} failed:`, error);
    throw error.response ? error.response.data : error;
  }
};

// Utility function for DELETE requests
export const deleteData = async (endpoint) => {
  const token = await getToken();
  try {
    const response = await api.delete(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error(`DELETE ${endpoint} failed:`, error);
    throw error.response ? error.response.data : error;
  }
};
