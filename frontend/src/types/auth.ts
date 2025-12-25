export interface User {
  username: string;
  email?: string;
  id?: number | string;
  is_staff?: boolean;
  is_superuser?: boolean;
}

export interface AuthResponse {
  token?: string;
  is_authenticated: boolean;
  is_staff: boolean;
  username: string;
  email?: string;
}

export interface LoginCredentials {
  username?: string;
  email?: string;
  password?: string;
}

export interface RegisterPayload {
  username: string;
  password?: string;
  email?: string;
  [key: string]: any;
}
