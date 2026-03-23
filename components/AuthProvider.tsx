'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import { AlertCircle, Settings } from 'lucide-react';

interface AuthContextType {
  user: any;
  profile: any;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const pathnameRef = React.useRef(pathname);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    console.log('AuthProvider: Initializing...', { isSupabaseConfigured });
    
    // Safety timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('AuthProvider: Safety timeout reached, forcing loading false');
      setLoading(false);
    }, 8000);

    if (!isSupabaseConfigured) {
      console.log('AuthProvider: Supabase not configured');
      setLoading(false);
      clearTimeout(timeout);
      return;
    }

    // Global error listener for Supabase AuthApiErrors
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      const isAuthError = error && (
        error.name === 'AuthApiError' || 
        error.message?.includes('Refresh Token Not Found') ||
        error.message?.includes('invalid_grant') ||
        error.status === 400 ||
        error.status === 401
      );

      if (isAuthError) {
        console.log('AuthProvider: Global AuthApiError caught', error.message);
        event.preventDefault();
        event.stopPropagation();
        
        try {
          const keys = Object.keys(localStorage);
          keys.forEach(key => {
            if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
              localStorage.removeItem(key);
            }
          });
        } catch (e) {}
        
        setUser(null);
        setProfile(null);
        setLoading(false);
        
        const publicRoutes = ['/', '/register'];
        if (pathnameRef.current && !publicRoutes.includes(pathnameRef.current)) {
          router.push('/');
        }
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    const fetchProfile = async (userId: string, userEmail?: string) => {
      try {
        console.log('AuthProvider: Fetching profile for', userId);
        let { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        if (error) {
          console.log('AuthProvider: Profile fetch error (expected if new user)', error.message);
          return null;
        }

        // Auto-upgrade admin role if email matches
        const adminEmails = ['ciepcentrointegradodeensinopro@gmail.com', 'test@gmail.com'];
        if (userEmail && adminEmails.includes(userEmail) && data.role !== 'admin') {
          console.log('AuthProvider: Auto-upgrading admin role in database');
          const { data: updatedData, error: updateError } = await supabase
            .from('profiles')
            .update({ role: 'admin' })
            .eq('user_id', userId)
            .select()
            .single();
          
          if (!updateError) {
            return updatedData;
          }
        }

        return data;
      } catch (err) {
        console.error('AuthProvider: Profile fetch exception', err);
        return null;
      }
    };

    const initialize = async () => {
      try {
        console.log('AuthProvider: Starting initialization');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('AuthProvider: getSession error', sessionError.message);
          throw sessionError;
        }

        if (session?.user) {
          console.log('AuthProvider: Initial session found', session.user.id);
          setUser(session.user);
          const profileData = await fetchProfile(session.user.id, session.user.email);
          setProfile(profileData);
        } else {
          console.log('AuthProvider: No initial session');
          setUser(null);
          setProfile(null);
        }
      } catch (error: any) {
        console.error('AuthProvider: Initialization error', error);
        if (error.message?.includes('Refresh Token') || error.status === 400 || error.status === 401) {
          await supabase.auth.signOut().catch(() => {
            localStorage.clear();
          });
        }
      } finally {
        console.log('AuthProvider: Initialization finally block');
        setLoading(false);
        clearTimeout(timeout);
      }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthProvider: onAuthStateChange', event, session?.user?.id);
      
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setLoading(false);
      } else if (session?.user) {
        setUser(session.user);
        // Only fetch profile if it's not already set or if it's a login event
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          const profileData = await fetchProfile(session.user.id, session.user.email);
          setProfile(profileData);
        }
        setLoading(false);
      } else {
        setLoading(false);
      }
      clearTimeout(timeout);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [router]);

  // Basic route protection
  useEffect(() => {
    if (!loading && isSupabaseConfigured) {
      const publicRoutes = ['/', '/register'];
      if (!user && pathname && !publicRoutes.includes(pathname)) {
        router.push('/');
      }
    }
  }, [user, loading, pathname, router]);

  const adminEmails = ['ciepcentrointegradodeensinopro@gmail.com', 'test@gmail.com'];
  const isAdmin = profile?.role === 'admin' || (user?.email && adminEmails.includes(user.email));

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-6">
          <div className="size-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-amber-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">Configuração Necessária</h1>
            <p className="text-slate-400">
              Para utilizar o CiepApp, você precisa configurar sua conexão com o Supabase.
            </p>
          </div>
          <div className="bg-slate-950 rounded-xl p-4 text-left space-y-3 border border-slate-800">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Passos para configurar:</p>
            <ol className="text-sm text-slate-300 space-y-2 list-decimal list-inside">
              <li>Crie um projeto no <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-green-500 hover:underline">Supabase</a></li>
              <li>Acesse <span className="text-slate-100 font-mono">Project Settings &gt; API</span></li>
              <li>Copie a <span className="text-slate-100 font-mono">Project URL</span> e a <span className="text-slate-100 font-mono">anon public key</span></li>
              <li>Adicione-as nas configurações do AI Studio</li>
            </ol>
          </div>
          <div className="pt-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 justify-center">
              <Settings className="w-4 h-4" />
              <span>Variáveis: NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
