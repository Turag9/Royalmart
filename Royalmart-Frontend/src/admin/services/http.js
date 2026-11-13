import axios from 'axios';
import { attachTokenInterceptors } from '../../utils/authToken';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const http = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

attachTokenInterceptors(http);

export function getApiError(error, fallback = 'Something went wrong') {
  return error?.response?.data?.message || fallback;
}
