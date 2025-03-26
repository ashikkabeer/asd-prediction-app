// API configuration

const DEV_API_URL = 'http://192.168.85.29:8080';
const PROD_API_URL = 'https://your-production-api.com';

// Use environment variables if available, otherwise fallback to development URL
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEV_API_URL;

// API endpoints
export const API_ENDPOINTS = {
  login: `${API_BASE_URL}/login`,
  getQuestions: (age: string) => `${API_BASE_URL}/get_questions?age=${age}`,
  predict: `${API_BASE_URL}/predict`,
  hospitals: `${API_BASE_URL}/proxy/hospitals`,
};