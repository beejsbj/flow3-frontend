import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useRouter } from "next/navigation";
import { AuthService } from "@/services/auth";

interface User {
  id: string;
  email: string;
  name: string;
  organization: string;
  avatarUrl: string | null;
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  accessToken: string | null;

  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  setError: (error: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    organization: string
  ) => Promise<void>;
  logout: () => void;
  updateDisplayName: (name: string) => void;
}

// #TODO: Remove persist middleware when implementing proper auth flow
// #TODO: Move token storage to httpOnly cookies
// #TODO: Add refresh token logic
export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      accessToken: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setAccessToken: (token) => set({ accessToken: token }),
      setError: (error) => set({ error }),

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          const { user, token } = await AuthService.login({ email, password });
          set({
            user,
            accessToken: token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Failed to login",
          });
          throw error; // Re-throw to handle in UI if needed
        }
      },

      register: async (
        name: string,
        email: string,
        password: string,
        organization: string
      ) => {
        try {
          set({ isLoading: true, error: null });
          const { user, token } = await AuthService.register({
            name,
            email,
            password,
            organization,
          });
          set({
            user,
            accessToken: token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error ? error.message : "Failed to register",
          });
          throw error; // Re-throw to handle in UI if needed
        }
      },

      logout: () =>
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          error: null,
        }),

      updateDisplayName: (name) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, name } });
        }
      },
    }),
    {
      name: "user-storage", // #TODO: Remove when implementing proper auth
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // #TODO: Remove token persistence when implementing proper auth
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Add a new hook to handle logout with navigation
export const useLogout = () => {
  const router = useRouter();
  const logout = useUserStore((state) => state.logout);

  return () => {
    logout();
    router.push("/auth");
  };
};

// Convenience exports for common selectors
export const useUser = () => {
  const user = useUserStore((state) => state.user);
  const avatarUrl = user?.avatarUrl ?? "https://github.com/shadcn.png";
  return { ...user, avatarUrl };
};

export const useIsAuthenticated = () =>
  useUserStore((state) => state.isAuthenticated);

export const useAuthError = () => useUserStore((state) => state.error);
export const useIsLoading = () => useUserStore((state) => state.isLoading);
