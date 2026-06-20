import { create } from 'zustand';
import Cookies from 'js-cookie';
import {
  persistTokens,
  clearTokens,
} from '@/lib/apiServices';
import type { AuthData } from '@/lib/types';

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

function extractRoles(payload: any): string[] {
  if (!payload) return [];
  const rawRoles = payload.roles ?? payload.role ?? payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ?? [];
  if (Array.isArray(rawRoles)) {
    return rawRoles;
  }
  if (typeof rawRoles === 'string') {
    return [rawRoles];
  }
  return [];
}

/** Check if roles array contains an admin role */
function checkIsAdmin(roles: string[]): boolean {
  const adminRoles = ['Admin', 'SuperAdmin', 'admin', 'superadmin'];
  return roles.some((r) => adminRoles.includes(r));
}

/** Decode JWT payload to extract user info (without verification — client-side only) */
function decodeJwtPayload(token: string): Partial<User> | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    const roles = extractRoles(payload);
    return {
      id: payload.sub ?? payload.id ?? '',
      email: payload.email ?? '',
      userName: payload.name ?? payload.userName ?? '',
      roles,
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
      const isAdmin = checkIsAdmin(roles);
      set({
        isAuthenticated: !!payload,
        isAdmin,
        user: payload
          ? {
              id: payload.id ?? '',
              email: payload.email ?? '',
              userName: payload.userName ?? '',
              roles,
            }
          : null,
      });
    } else {
      set({
        isAuthenticated: false,
        isAdmin: false,
        user: null,
      });
    }
  },
}));
