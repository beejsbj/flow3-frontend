import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;

  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  login: (user: User, token: string) => void;
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
      accessToken: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setAccessToken: (token) => set({ accessToken: token }),

      login: (user, token) =>
        set({
          user,
          accessToken: token,
          isAuthenticated: true,
          isLoading: false,
        }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
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
