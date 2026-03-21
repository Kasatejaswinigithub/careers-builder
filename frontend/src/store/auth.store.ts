import { create } from 'zustand';
import { authApi } from '../api';

interface User { _id: string; email: string; role: string; tenantId: string; }
interface Tenant { _id: string; slug: string; name: string; plan: string; published: boolean; branding: Record<string, string>; }

interface AuthState {
  token: string | null;
  user: User | null;
  tenant: Tenant | null;
  loading: boolean;
  login: (email: string, password: string, tenantSlug: string) => Promise<void>;
  register: (tenantName: string, slug: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loadMe: () => Promise<void>;
  setTenant: (tenant: Tenant) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token:   localStorage.getItem('token'),
  user:    null,
  tenant:  null,
  loading: false,

  login: async (email, password, tenantSlug) => {
    set({ loading: true });
    try {
      const data = await authApi.login(email, password, tenantSlug);
      localStorage.setItem('token', data.token);
      set({ token: data.token, user: data.user, tenant: data.tenant });
    } finally { set({ loading: false }); }
  },

  register: async (tenantName, slug, email, password) => {
    set({ loading: true });
    try {
      const data = await authApi.register(tenantName, slug, email, password);
      localStorage.setItem('token', data.token);
      set({ token: data.token, user: data.user, tenant: data.tenant });
    } finally { set({ loading: false }); }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null, tenant: null });
  },

  loadMe: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const { user, tenant } = await authApi.me();
      set({ user, tenant, token });
    } catch {
      localStorage.removeItem('token');
      set({ token: null, user: null, tenant: null });
    }
  },

  setTenant: (tenant) => set({ tenant }),
}));
