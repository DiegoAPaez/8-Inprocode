export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  username: string;
  csrfToken?: string;
  message: string;
}

export interface UserDetailsResponse {
  id: number;
  username: string;
  email: string;
  roles: string[];
}

export interface AuthContextType {
  user: UserDetailsResponse | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
  checkAuthStatus: () => Promise<void>;
}

export interface User {
  id: number;
  username: string;
  email: string;
  roles: Role[];
}

export interface Role {
  id: number;
  name: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  roles: string[];
}

export interface UpdateUserRequest {
  username: string;
  email: string;
  role: string;
}

export interface ChangePasswordRequest {
  newPassword: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: number;
}
