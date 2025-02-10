interface User {
  id: string;
  email: string;
  name: string;
  organization: string;
  avatarUrl: string | null;
}

interface LoginResponse {
  user: User;
  token: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  organization: string;
}

const API_URL = "https://flow3-backend.vercel.app/api";

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to login");
    }

    return data;
  }

  static async register(
    credentials: RegisterCredentials
  ): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to register");
    }

    return data;
  }

  // We can add more auth-related methods here later
  // static async register(userData: RegisterData): Promise<LoginResponse> { ... }
  // static async logout(): Promise<void> { ... }
  // static async resetPassword(email: string): Promise<void> { ... }
}
