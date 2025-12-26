
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { UserRole, User } from '../types';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isLoading: boolean;
  signIn: (email: string, role: UserRole) => Promise<void>; 
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(UserRole.AGENT);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email, name: session.user.user_metadata?.full_name || 'User', role: UserRole.AGENT });
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email, name: session.user.user_metadata?.full_name || 'User', role: UserRole.AGENT });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, selectedRole: UserRole) => {
    const ownsProperty = email.includes('investor') || email.includes('relo') || selectedRole === UserRole.SELLER;
    
    const demoUser: User = { 
        email, 
        id: 'demo-user', 
        name: email.split('@')[0], 
        role: selectedRole,
        ownsProperty: ownsProperty 
    };
    
    setUser(demoUser);
    setRole(selectedRole);
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, isLoading, signIn, signOut }}>
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
