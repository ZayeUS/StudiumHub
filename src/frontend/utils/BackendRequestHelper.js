import axios from "axios";
import { auth } from "../../firebase";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const getToken = async () => {
  const currentUser = auth.currentUser;
  if (currentUser) {
    const token = await currentUser.getIdToken(true);
    return token;
  }
  return null;
};

export const getData = async (endpoint) => {
  const token = await getToken();
  try {
    const response = await api.get(endpoint, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  } catch (error) {
    console.error(`GET ${endpoint} failed:`, error);
    throw error.response ? error.response.data : error;
  }
};

export const postData = async (endpoint, payload, requireAuth = true) => {
  const token = await getToken();
  const headers = requireAuth && token ? { Authorization: `Bearer ${token}` } : {};
  try {
    const response = await api.post(endpoint, payload, {
      headers,
    });
    return response.data;
  } catch (error) {
    console.error(`POST ${endpoint} failed:`, error);
    throw error.response ? error.response.data : error;
  }
};

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
