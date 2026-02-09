import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database.types';
import { useNavigate } from 'react-router-dom';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchProfile = useCallback(async (userId: string) => {
        console.log('[AuthContext] Fetching profile for user:', userId);

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                // PGRST116 means 0 rows returned for .single()
                if (error.code === 'PGRST116') {
                    console.log('[AuthContext] Profile not found, creating a default one...');
                    const { data: userData } = await supabase.auth.getUser();
                    const email = userData?.user?.email;

                    const { data: newProfile, error: insertError } = await (supabase
                        .from('profiles') as any)
                        .insert({
                            id: userId,
                            full_name: email?.split('@')[0] || 'Utilisateur',
                            email: email,
                            role: 'voyageur'
                        })
                        .select()
                        .single();

                    if (insertError) {
                        console.error('[AuthContext] Error creating default profile:', insertError);
                        setProfile(null);
                    } else {
                        console.log('[AuthContext] Default profile created:', newProfile);
                        setProfile(newProfile);
                    }
                    return;
                }
                console.error('[AuthContext] Profile fetch error:', error);
                setProfile(null);
                return;
            }

            console.log('[AuthContext] Setting profile:', data);
            setProfile(data);
        } catch (error) {
            console.error('[AuthContext] Exception in fetchProfile:', error);
            setProfile(null);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;

        const initializeAuth = async () => {
            console.log('[AuthContext] Initializing auth...');
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!isMounted) return;

                const currentUser = session?.user ?? null;
                setUser(currentUser);

                if (currentUser) {
                    await fetchProfile(currentUser.id);
                }
            } catch (error) {
                console.error('[AuthContext] Auth initialization error:', error);
            } finally {
                if (isMounted) {
                    console.log('[AuthContext] Auth initialized, loading=false');
                    setLoading(false);
                }
            }
        };

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('[AuthContext] Auth state changed:', event);
            if (!isMounted) return;

            const currentUser = session?.user ?? null;
            setUser(currentUser);

            if (event === 'SIGNED_IN' && currentUser) {
                // Only fetch if not already initialized or if user changed
                fetchProfile(currentUser.id);
            } else if (event === 'SIGNED_OUT') {
                setProfile(null);
                setLoading(false);
            } else if (event === 'INITIAL_SESSION' && currentUser) {
                fetchProfile(currentUser.id);
            }
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, [fetchProfile]);

    const signOut = useCallback(async () => {
        console.log('[AuthContext] SignOut initiated');
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error('[AuthContext] Error during signOut:', error);
        }

        // Force clear localStorage as a precaution
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('sb-') || key.includes('supabase')) {
                localStorage.removeItem(key);
            }
        });

        setUser(null);
        setProfile(null);
        navigate('/', { replace: true });
    }, [navigate]);

    const refreshProfile = useCallback(async () => {
        if (user) {
            await fetchProfile(user.id);
        }
    }, [user, fetchProfile]);

    const value = useMemo(() => ({
        user,
        profile,
        loading,
        signOut,
        refreshProfile
    }), [user, profile, loading, signOut, refreshProfile]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
