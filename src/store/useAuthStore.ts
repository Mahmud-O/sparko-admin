import { create } from 'zustand';
import Cookies from 'js-cookie';
import {
  persistTokens,
  clearTokens,
} from '@/lib/apiServices';
import type { AuthData } from '@/lib/apiServices';

export interface User {
  id: string;
  email: string;
  userName: string;
  roles: string[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;

  logout: () => void;
  clearError: () => void;
  hydrate: () => void;
}

/** Check if roles array contains an admin role */
function checkIsAdmin(roles: string[]): boolean {
  const adminRoles = ['Admin', 'SuperAdmin', 'admin', 'superadmin'];
  return roles.some((r) => adminRoles.includes(r));
}

/** Decode JWT payload to extract user info (without verification — client-side only) */
function decodeJwtPayload(token: string): Partial<User> | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.sub ?? payload.id ?? '',
      email: payload.email ?? '',
      userName: payload.name ?? payload.userName ?? '',
      roles: payload.roles ?? [],
    };
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: true,
  isAdmin: true,
  isLoading: false,
  error: null,

  logout: () => {
    clearTokens();
    set({ user: null, isAuthenticated: false, isAdmin: false, error: null });
  },

  clearError: () => set({ error: null }),

  hydrate: () => {
    const token = Cookies.get('token');
    if (token) {
      const payload = decodeJwtPayload(token);
      const roles = payload?.roles ?? [];
      set({
        isAuthenticated: true,
        isAdmin: checkIsAdmin(roles),
        user: payload
          ? {
              id: payload.id ?? '',
              email: payload.email ?? '',
              userName: payload.userName ?? '',
              roles,
            }
          : null,
      });
    }
  },
}));
