import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types';
import { OfflineAuthManager } from '../utils/offlineAuth';
import { OfflineDataCache } from '../utils/offlineDataCache';
import {
    signIn,
    signUp,
    signOutUser,
    fetchUserByEmail,
    initializeUserFields,
    subscribeAuthState,
    checkForceSignOut,
} from '../features/auth/authService';

interface AuthContextType {
    currentUser: User | null;
    isAuthenticated: boolean;
    authLoading: boolean;
    isLoading: boolean;
    setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    handleLogin: (email: string, password: string) => Promise<{ error?: string }>;
    handleSignup: (email: string, password: string, name: string) => Promise<{ error?: string }>;
    handleLogout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be inside AuthProvider');
    return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    // Restore cached session on mount
    useEffect(() => {
        const cachedUser = OfflineAuthManager.getCachedSession();
        if (cachedUser) {
            setCurrentUser(cachedUser as User);
            setIsAuthenticated(true);
            setAuthLoading(false);
        }
    }, []);

    // Firebase auth state listener
    useEffect(() => {
        const cachedUser = OfflineAuthManager.getCachedSession();
        if (!navigator.onLine && cachedUser) {
            setAuthLoading(false);
            return;
        }

        const unsubscribe = subscribeAuthState(async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const userData = await fetchUserByEmail(firebaseUser.email!);
                    if (!userData) {
                        setAuthLoading(false);
                        return;
                    }

                    const wasForced = await checkForceSignOut(userData, firebaseUser);
                    if (wasForced) {
                        await signOutUser();
                        setIsAuthenticated(false);
                        setCurrentUser(null);
                        alert('You have been signed out by an administrator. Please sign in again.');
                        setAuthLoading(false);
                        return;
                    }

                    const initializedUser = await initializeUserFields(userData);
                    setCurrentUser(initializedUser);
                    setIsAuthenticated(true);
                    OfflineAuthManager.saveSession(initializedUser);
                } catch (error) {
                    console.error('Error in auth state handler:', error);
                    const cached = OfflineAuthManager.getCachedSession();
                    if (cached) {
                        setCurrentUser(cached as User);
                        setIsAuthenticated(true);
                    } else if (navigator.onLine) {
                        await signOutUser();
                        setIsAuthenticated(false);
                        setCurrentUser(null);
                    }
                }
            } else {
                const cached = OfflineAuthManager.getCachedSession();
                if (cached) {
                    setCurrentUser(cached as User);
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                    setCurrentUser(null);
                }
            }
            setAuthLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleLogin = async (email: string, password: string) => {
        try {
            await signIn(email, password);
            return {};
        } catch (error: any) {
            if (error.code === 'auth/invalid-credential') {
                return { error: 'Invalid email or password' };
            } else if (error.code === 'auth/too-many-requests') {
                return { error: 'Too many failed login attempts. Please try again later.' };
            }
            return { error: 'An error occurred during login' };
        }
    };

    const handleSignup = async (email: string, password: string, name: string) => {
        try {
            await signUp(email, password, name);
            return {};
        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                return { error: 'Email is already registered' };
            } else if (error.code === 'auth/weak-password') {
                return { error: 'Password should be at least 6 characters' };
            }
            return { error: 'An error occurred during signup' };
        }
    };

    const handleLogout = async () => {
        try {
            await signOutUser();
            OfflineDataCache.clearAll();
            setIsAuthenticated(false);
            setCurrentUser(null);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                currentUser,
                isAuthenticated,
                authLoading,
                isLoading,
                setCurrentUser,
                setIsLoading,
                handleLogin,
                handleSignup,
                handleLogout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
