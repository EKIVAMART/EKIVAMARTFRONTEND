export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: 'CUSTOMER' | 'VENDOR' | 'ADMIN' | 'SUPER-ADMIN';
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface Session {
  id: string;
  deviceInfo: string;
  ipAddress: string;
  location?: string;
  isCurrentSession: boolean;
  createdAt: string;
  lastActivityAt: string;
}

export interface ApiError {
  message: string;
  code?: string;
  field?: string;
}

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  feedback: string;
  color: string;
  label: string;
}
