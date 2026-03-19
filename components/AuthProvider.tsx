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
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log('AuthProvider: Initializing...', { isSupabaseConfigured });
    
    // Safety timeout to prevent infinite loading if Supabase hangs
    const timeout = setTimeout(() => {
      console.log('AuthProvider: Safety timeout reached');
      setLoading(false);
    }, 5000);

    if (!isSupabaseConfigured) {
      console.log('AuthProvider: Supabase not configured');
      setLoading(false);
      clearTimeout(timeout);
      return;
    }

    const getSession = async () => {
      try {
        console.log('AuthProvider: Fetching session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session fetch error:', sessionError);
          setLoading(false);
          return;
        }

        console.log('AuthProvider: Session fetched', { hasUser: !!session?.user });
        setUser(session?.user ?? null);
        
        if (session?.user) {
          try {
            console.log('AuthProvider: Fetching profile for user', session.user.id);
            // Try to fetch profile
            let { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .single();
            
            if (error && session.user) {
              console.log('AuthProvider: Profile not found, retrying...');
              // Wait a bit and try again (for new users where profile might be created by trigger)
              await new Promise(resolve => setTimeout(resolve, 1000));
              const { data: retryData } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', session.user.id)
                .single();
              data = retryData;
            }
            console.log('AuthProvider: Profile fetched', { hasProfile: !!data });
            setProfile(data);
          } catch (profileErr) {
            console.error('Profile fetch error in getSession:', profileErr);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        console.log('AuthProvider: Initialization complete');
        setLoading(false);
        clearTimeout(timeout);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthProvider: Auth state changed', { event, hasUser: !!session?.user });
      setUser(session?.user ?? null);
      if (session?.user) {
        try {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
          setProfile(data);
        } catch (error) {
          console.error('Profile fetch error in onAuthStateChange:', error);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
      clearTimeout(timeout);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  // Basic route protection
  useEffect(() => {
    if (!loading && isSupabaseConfigured) {
      const publicRoutes = ['/', '/register'];
      if (!user && pathname && !publicRoutes.includes(pathname)) {
        router.push('/');
      }
    }
  }, [user, loading, pathname, router]);

  const isAdmin = profile?.role === 'admin' || user?.email === 'ciepcentrointegradodeensinopro@gmail.com';

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

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
