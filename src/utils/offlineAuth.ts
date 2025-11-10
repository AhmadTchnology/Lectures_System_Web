// Offline Authentication Manager
interface CachedUser {
  id: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  name: string;
  favorites?: string[];
  completedLectures?: string[];
  unreadAnnouncements?: string[];
  cachedAt: number;
}

interface AuthSession {
  user: CachedUser;
  expiresAt: number;
  lastActivity: number;
}

const AUTH_CACHE_KEY = 'lms_auth_session';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export class OfflineAuthManager {
  // Save user session for offline access
  static saveSession(user: any): void {
    try {
      const session: AuthSession = {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
          favorites: user.favorites || [],
          completedLectures: user.completedLectures || [],
          unreadAnnouncements: user.unreadAnnouncements || [],
          cachedAt: Date.now(),
        },
        expiresAt: Date.now() + SESSION_DURATION,
        lastActivity: Date.now(),
      };

      localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(session));
      console.log('✅ Session saved for offline access:', user.email);
    } catch (error) {
      console.error('Error saving auth session:', error);
    }
  }

  // Get cached user session
  static getCachedSession(): CachedUser | null {
    try {
      const cached = localStorage.getItem(AUTH_CACHE_KEY);
      if (!cached) {
        console.log('❌ No cached session found');
        return null;
      }

      const session: AuthSession = JSON.parse(cached);

      // Check if session has expired
      if (Date.now() > session.expiresAt) {
        console.log('⏰ Session expired');
        this.clearSession();
        return null;
      }

      console.log('✅ Found valid cached session:', session.user.email);
      
      // Update last activity
      session.lastActivity = Date.now();
      localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(session));

      return session.user;
    } catch (error) {
      console.error('Error getting cached session:', error);
      return null;
    }
  }

  // Update cached user data
  static updateCachedUser(updates: Partial<CachedUser>): void {
    try {
      const cached = localStorage.getItem(AUTH_CACHE_KEY);
      if (!cached) return;

      const session: AuthSession = JSON.parse(cached);
      session.user = { ...session.user, ...updates };
      session.lastActivity = Date.now();

      localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('Error updating cached user:', error);
    }
  }

  // Clear session (on logout)
  static clearSession(): void {
    try {
      localStorage.removeItem(AUTH_CACHE_KEY);
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  }

  // Check if user is authenticated (online or offline)
  static isAuthenticated(): boolean {
    const session = this.getCachedSession();
    return session !== null;
  }

  // Extend session expiry
  static extendSession(): void {
    try {
      const cached = localStorage.getItem(AUTH_CACHE_KEY);
      if (!cached) return;

      const session: AuthSession = JSON.parse(cached);
      session.expiresAt = Date.now() + SESSION_DURATION;
      session.lastActivity = Date.now();

      localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('Error extending session:', error);
    }
  }

  // Get session info
  static getSessionInfo(): {
    isOnline: boolean;
    hasCache: boolean;
    expiresIn?: number;
  } {
    const hasCache = this.getCachedSession() !== null;
    const isOnline = navigator.onLine;

    if (!hasCache) {
      return { isOnline, hasCache: false };
    }

    try {
      const cached = localStorage.getItem(AUTH_CACHE_KEY);
      if (!cached) return { isOnline, hasCache: false };

      const session: AuthSession = JSON.parse(cached);
      const expiresIn = session.expiresAt - Date.now();

      return {
        isOnline,
        hasCache: true,
        expiresIn: Math.max(0, expiresIn),
      };
    } catch {
      return { isOnline, hasCache: false };
    }
  }
}
