import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import type {
  LoginRequest,
  LoginResponse,
  UserDetailsResponse,
  User,
  CreateUserRequest,
  UpdateUserRequest,
  ChangePasswordRequest
} from '../types/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

class TypedApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
    });
  }

  async get<T>(url: string): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url);
    return response.data;
  }

  async post<T>(url: string, data?: unknown): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: unknown): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data);
    return response.data;
  }

  async delete(url: string): Promise<void> {
    await this.client.delete(url);
  }
}

const apiClient = new TypedApiClient();

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/auth/login', credentials);
  },

  getCurrentUser: async (): Promise<UserDetailsResponse> => {
    return apiClient.get<UserDetailsResponse>('/auth/me');
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  }
};

export const adminApi = {
  getAllUsers: async (): Promise<User[]> => {
    return apiClient.get<User[]>('/admin/users');
  },

  createUser: async (userData: CreateUserRequest): Promise<User> => {
    return apiClient.post<User>('/admin/users', userData);
  },

  updateUser: async (id: number, userData: UpdateUserRequest): Promise<User> => {
    return apiClient.put<User>(`/admin/users/${id.toString()}`, userData);
  },

  changeUserPassword: async (id: number, passwordData: ChangePasswordRequest): Promise<void> => {
    await apiClient.put(`/admin/users/${id.toString()}/password`, passwordData);
  },

  deleteUser: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/users/${id.toString()}`);
  }
};
