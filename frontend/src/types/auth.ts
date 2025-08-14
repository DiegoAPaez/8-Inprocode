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
