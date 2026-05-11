import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";
import type{
  ReactNode,
} from "react";
import { authService } from "../services/authService";
import type { User, LoginPayload, RegisterPayload } from "../types/auth";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true, // true on mount so we check session first
  });

  // Check if user is already logged in on app load
useEffect(() => {
  authService
    .getUser()
    .then((user) => {
      // console.log('getUser success:', user)
      setState({ user, isAuthenticated: true, isLoading: false })
    })
    .catch((err) => {
      // console.log('getUser failed:', err.response?.status, err.response?.data)
      setState({ user: null, isAuthenticated: false, isLoading: false })
    })
}, [])

  const login = async (payload: LoginPayload) => {
    const { user } = await authService.login(payload);
    setState({ user, isAuthenticated: true, isLoading: false });
  };

  const register = async (payload: RegisterPayload) => {
    const { user } = await authService.register(payload);
    setState({ user, isAuthenticated: true, isLoading: false });
  };

  const logout = async () => {
    await authService.logout();
    setState({ user: null, isAuthenticated: false, isLoading: false });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an <AuthProvider>");
  return ctx;
}