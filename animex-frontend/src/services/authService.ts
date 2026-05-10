import api from "../api/axtios"; // your axios instance
import type { AuthResponse, LoginPayload, RegisterPayload, User } from "../types/auth";

// Must be called before login to get the XSRF cookie
const getCsrfCookie = (): Promise<void> =>
  api.get("/sanctum/csrf-cookie");

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    await getCsrfCookie();
    const { data } = await api.post<AuthResponse>("/api/register", payload);
    return data;
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    await getCsrfCookie();
    const { data } = await api.post<AuthResponse>("/api/login", payload);
    return data;
  },

  async logout(): Promise<void> {
    await api.post("/api/logout");
  },

  async getUser(): Promise<User> {
    const { data } = await api.get<User>("/api/user");
    return data;
  },
};