export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

const TOKEN_KEY = 'zanzirangi_cms_jwt_token';
const USER_KEY = 'zanzirangi_cms_user';
export const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

export const authApi = {
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setToken(token: string): void {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch (e) {
      console.error('Error saving token', e);
    }
  },

  getUser(): AdminUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  setUser(user: AdminUser): void {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Error saving user', e);
    }
  },

  clearSession(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (e) {
      console.error('Error clearing session', e);
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  async login(email: string, password: string): Promise<{ success: boolean; user?: AdminUser; token?: string; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        return {
          success: false,
          error: data.error || 'Authentication failed. Please verify your credentials.',
        };
      }

      this.setToken(data.token);
      this.setUser(data.user);
      return {
        success: true,
        user: data.user,
        token: data.token,
      };
    } catch (err: any) {
      return {
        success: false,
        error: 'Unable to connect to CMS server. Please ensure the server is running.',
      };
    }
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    } finally {
      this.clearSession();
    }
  },

  async verifySession(): Promise<AdminUser | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        this.clearSession();
        return null;
      }

      const data = await res.json();
      if (data.success && data.user) {
        this.setUser(data.user);
        return data.user;
      }
      return null;
    } catch {
      // In offline scenario keep current local user if exists
      return this.getUser();
    }
  },
};
