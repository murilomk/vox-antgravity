
import React, { createContext, useState, useContext, ReactNode, useEffect, useRef } from 'react';
import { User } from './types';
import { supabase } from './supabaseClient';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, pass: string) => Promise<void>;
    register: (name: string, email: string, pass: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    loginWithFacebook: () => Promise<void>;
    logout: () => void;
    forgotPassword: (email: string) => Promise<void>;
    refreshProfile: () => Promise<void>;
    error: string | null;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const mountedRef = useRef(true);

    // Fetch full profile from public.profiles table
    const fetchProfile = async (userId: string, email?: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                // Check for various forms of "table not found" or "row not found" errors
                const isTableMissing = error.code === '42P01' || error.message?.includes('Could not find the table');
                const isRowMissing = error.code === 'PGRST116';

                if (!isTableMissing && !isRowMissing) {
                    console.error('Error fetching profile:', error.message || JSON.stringify(error));
                } else if (isTableMissing) {
                    console.warn("Supabase 'profiles' table not found. Using local fallback profile.");
                }

                // Fallback: If profile doesn't exist (table missing or trigger failed), 
                // return a generated profile so the app remains usable.
                if (userId) {
                    return {
                        id: userId,
                        email: email || '',
                        name: email?.split('@')[0] || 'User',
                        handle: '@' + (email?.split('@')[0]?.replace(/[^a-z0-9]/gi, '') || 'user'),
                        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
                        coverUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1000&q=80',
                        bio: 'Welcome to VoxNet',
                        followers: 0,
                        following: 0,
                        postsCount: 0,
                        isVerified: false,
                        themeColor: '#8b5cf6',
                        joinDate: new Date().toLocaleDateString()
                    } as User;
                }
                return null;
            }

            return {
                id: data.id,
                email: email || '',
                name: data.name || 'User',
                handle: data.username || `@user${data.id.substring(0, 4)}`,
                avatar: data.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.id}`,
                coverUrl: data.banner_url || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1000&q=80',
                bio: data.bio || '',
                followers: 0,
                following: 0,
                postsCount: 0,
                isVerified: false,
                themeColor: '#8b5cf6',
                joinDate: new Date(data.created_at).toLocaleDateString()
            } as User;
        } catch (e: any) {
            console.error('Exception in fetchProfile:', e.message || e);
            // Emergency fallback
            return {
                id: userId,
                email: email || '',
                name: 'User',
                handle: '@user',
                avatar: 'https://via.placeholder.com/150',
            } as User;
        }
    };

    // Centralized session handler: sets user and loading state safely
    const handleSession = async (session: any) => {
        if (!mountedRef.current) return;
        try {
            if (session?.user) {
                const profile = await fetchProfile(session.user.id, session.user.email);
                if (mountedRef.current && profile) setUser(profile);
            } else {
                if (mountedRef.current) setUser(null);
            }
        } catch (e) {
            console.error('handleSession error:', e);
        } finally {
            if (mountedRef.current) setIsLoading(false);
        }
    };

    useEffect(() => {
        mountedRef.current = true;
        setIsLoading(true);

        let subscription: any = null;

        // Do an initial check and set up a listener. We treat getSession + onAuthStateChange together
        (async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                await handleSession(session);

                const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
                    // When auth changes, update user accordingly
                    handleSession(newSession);
                });

                subscription = data?.subscription;
            } catch (e) {
                console.error('Auth init error:', e);
                if (mountedRef.current) setIsLoading(false);
            }
        })();

        return () => {
            mountedRef.current = false;
            try {
                subscription?.unsubscribe?.();
            } catch (e) { /* noop */ }
        };
    }, []);

    const refreshProfile = async () => {
        try {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            const uid = currentUser?.id || user?.id;
            if (!uid) return;
            const profile = await fetchProfile(uid, currentUser?.email || user?.email);
            if (profile && mountedRef.current) setUser(profile);
        } catch (e) {
            console.error('refreshProfile failed', e);
        }
    };

    const login = async (email: string, pass: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password: pass });
            if (authError) {
                console.error('signIn error', authError);
                setError(authError.message || 'Failed to login');
                setIsLoading(false);
                return;
            }

            // If signIn returns a session, we can fetch profile right away
            const session = (data as any)?.session;
            if (session?.user) {
                await handleSession(session);
            }
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err?.message || 'Login failed');
            setIsLoading(false);
        }
    };

    const register = async (name: string, email: string, pass: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const handle = '@' + name.toLowerCase().replace(/\s+/g, '') + Math.floor(Math.random() * 1000);

            const { data, error: authError } = await supabase.auth.signUp({
                email,
                password: pass,
                options: {
                    data: {
                        name,
                        handle,
                        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
                    }
                }
            });

            if (authError) throw authError;

            // Registration successful - the auth state listener will handle the rest
        } catch (err: any) {
            setError(err.message || 'Registration failed.');
        } finally {
            if (mountedRef.current) setIsLoading(false);
        }
    };

    const loginWithGoogle = async () => {
        setError("Google Login requires Supabase OAuth configuration.");
    };

    const loginWithFacebook = async () => {
        setError("Facebook Login requires Supabase OAuth configuration.");
    };

    const forgotPassword = async (email: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email);
            if (error) throw error;
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await supabase.auth.signOut();
            if (mountedRef.current) setUser(null);
        } catch (e) {
            console.error(e);
        } finally {
            if (mountedRef.current) setIsLoading(false);
        }
    };

    const clearError = () => setError(null);

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isLoading,
            login,
            register,
            loginWithGoogle,
            loginWithFacebook,
            logout,
            forgotPassword,
            refreshProfile,
            error,
            clearError
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
