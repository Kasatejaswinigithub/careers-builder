import { create } from 'zustand';
import { authApi } from '../api';

interface User { 
  _id: string; 
  email: string; 
  role: string; 
  tenantId: string; 
}

interface Tenant { 
  _id: string; 
  slug: string; 
  name: string; 
  plan: string; 
  published: boolean; 
  branding: {
    primaryColor: string;
    secondaryColor: string;
    logoUrl: string;
    bannerUrl: string;
    heroHeadline: string;
    heroSubtext: string;
    about: string;
    lifeAtCompany: string;
  }; 
}

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
  token: localStorage.getItem('token'),
  user: null,
  tenant: null,
  loading: false,

  login: async (email, password, tenantSlug) => {
    set({ loading: true });
    try {
      const res = await authApi.login(email, password, tenantSlug);
      // Ensure we handle both raw data and Axios-wrapped data
      const data = res.data || res; 
      
      localStorage.setItem('token', data.token);
      set({ token: data.token, user: data.user, tenant: data.tenant });
    } catch (err) {
      set({ loading: false }); // Reset loading on error
      throw err; // Re-throw so the UI can show the error message
    } finally { 
      set({ loading: false }); 
    }
  },

  register: async (tenantName, slug, email, password) => {
    set({ loading: true });
    try {
      const res = await authApi.register(tenantName, slug, email, password);
      const data = res.data || res;

      localStorage.setItem('token', data.token);
      set({ token: data.token, user: data.user, tenant: data.tenant });
    } catch (err) {
      set({ loading: false });
      throw err;
    } finally { 
      set({ loading: false }); 
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null, tenant: null });
  },

  loadMe: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await authApi.me();
      const { user, tenant } = res.data || res;
      set({ user, tenant, token });
    } catch (err) {
      localStorage.removeItem('token');
      set({ token: null, user: null, tenant: null });
    }
  },

  // Helper to update tenant state immediately (useful for Preview/Editor sync)
  setTenant: (tenant) => set({ tenant }),
}));