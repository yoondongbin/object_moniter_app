// src/utils/axiosInstance.ts
import axios from 'axios';
import { BASE_API_URL } from '@env';

const axiosInstance = axios.create({
  baseURL: BASE_API_URL,
  timeout: 5000,
});

export default axiosInstance;