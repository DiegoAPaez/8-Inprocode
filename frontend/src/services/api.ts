import axios from 'axios';
import type {LoginRequest, LoginResponse, UserDetailsResponse} from '../types/auth';

const API_BASE_URL = 'http://localhost:8080/api';

// Configure axios to include credentials (cookies) in requests
axios.defaults.withCredentials = true;

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
    return response.data;
  },

  getCurrentUser: async (): Promise<UserDetailsResponse> => {
    const response = await axios.get(`${API_BASE_URL}/auth/me`);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await axios.post(`${API_BASE_URL}/auth/logout`);
  }
};

export const adminApi = {
  getAllUsers: async () => {
    const response = await axios.get(`${API_BASE_URL}/admin/users`);
    return response.data;
  },

  createUser: async (userData: any) => {
    const response = await axios.post(`${API_BASE_URL}/admin/users`, userData);
    return response.data;
  },

  updateUser: async (id: number, userData: any) => {
    const response = await axios.put(`${API_BASE_URL}/admin/users/${id}`, userData);
    return response.data;
  },

  changeUserPassword: async (id: number, passwordData: any) => {
    const response = await axios.put(`${API_BASE_URL}/admin/users/${id}/password`, passwordData);
    return response.data;
  },

  deleteUser: async (id: number) => {
    await axios.delete(`${API_BASE_URL}/admin/users/${id}`);
  }
};
