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

// CRITICAL FIX: Upload file function
export const uploadFile = async (endpoint, formData) => {
  if (!(formData instanceof FormData)) {
    throw new Error('uploadFile requires FormData as the second parameter');
  }
  
  const token = await getToken();
  
  try {
    // Create a custom instance for this request only to prevent
    // default headers from interfering with multipart form data
    const response = await axios({
      method: 'post',
      url: `${API_BASE_URL}${endpoint}`,
      data: formData,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        // DO NOT set Content-Type header - axios will set it 
        // automatically with the correct multipart boundary
      },
      // Add timeout and max content length settings
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 60000 // 60 seconds
    });
    
    return response.data;
  } catch (error) {
    console.error(`File upload to ${endpoint} failed:`, error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Response error data:", error.response.data);
      console.error("Response error status:", error.response.status);
      console.error("Response error headers:", error.response.headers);
      throw error.response.data;
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received:", error.request);
      throw new Error("No response received from server");
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error message:", error.message);
      throw error;
    }
  }
};