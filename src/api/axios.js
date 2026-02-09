import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Set this to your computer's IP if testing on a physical device locally (e.g. http://192.168.x.x:5000/api)
// Set this to your production Render URL for deployment
const MOBILE_DEV_IP = '192.168.100.17'; // Your local IP found via ipconfig
// const API_URL = `https://bussoftwareback-1.onrender.com/api`;
const API_URL = `http://${MOBILE_DEV_IP}:5000/api`;

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000, // 10s timeout
});

console.log('DEBUG: Active API_URL set to:', API_URL);

// Debug interceptor
api.interceptors.request.use(request => {
    console.log('--- API Request ---');
    console.log('URL:', request.baseURL + request.url);
    console.log('Method:', request.method?.toUpperCase());
    return request;
});

api.interceptors.response.use(
    response => {
        console.log('--- API Success ---');
        console.log('Status:', response.status);
        return response;
    },
    error => {
        console.log('--- API Error ---');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', error.response.data);
        } else if (error.request) {
            console.log('Error request:', error.request);
        } else {
            console.log('Error message:', error.message);
        }
        return Promise.reject(error);
    }
);
// Add a request interceptor to include the JWT token
api.interceptors.request.use(
    async (config) => {
        const token = await SecureStore.getItemAsync('userToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
