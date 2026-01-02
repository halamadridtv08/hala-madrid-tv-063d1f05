
import { createContext, useState, useContext, useEffect, useRef, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { showLoginSuccessToast, showLogoutSuccessToast } from '@/lib/authToasts';

type UserRole = 'admin' | 'moderator' | 'user';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  isModerator: boolean;
  userRole: UserRole | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isAdmin: false,
  isModerator: false,
  userRole: null,
  isLoading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRoleLoading, setIsRoleLoading] = useState(false);
  
  // Track current user to avoid race conditions
  const currentUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Set up auth state listener first (keep callback synchronous)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      setSession(session ?? null);
      setUser(session?.user ?? null);

      if (session?.user) {
        currentUserIdRef.current = session.user.id;
        // Defer Supabase calls to avoid auth deadlocks
        setIsRoleLoading(true);
        setTimeout(() => {
          checkUserRole(session.user.id);
        }, 0);

        if (event === "SIGNED_IN") {
          showLoginSuccessToast(session?.user?.email ?? undefined);
        }
      } else {
        currentUserIdRef.current = null;
        setIsAdmin(false);
        setIsModerator(false);
        setUserRole(null);
        setIsRoleLoading(false);
      }
    });

    // Then check for existing session
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session ?? null);
      setUser(session?.user ?? null);

      if (session?.user) {
        currentUserIdRef.current = session.user.id;
        setIsRoleLoading(true);
        await checkUserRole(session.user.id);
      } else {
        setUserRole('user'); // Set default role for non-authenticated users
      }

      setIsLoading(false);
    };

    initSession();

    return () => subscription.unsubscribe();
  }, []);

  const checkUserRole = async (userId: string) => {
    try {
      console.log("Checking user role for:", userId);
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      // Abort if user changed during fetch
      if (currentUserIdRef.current !== userId) {
        console.log("User changed during role check, aborting");
        return;
      }
      
      if (error) {
        console.error('Error checking user role:', error);
        setIsAdmin(false);
        setIsModerator(false);
        setUserRole('user');
        return;
      }
      
      const roles = data?.map(r => r.role) || [];
      console.log("User roles:", roles);
      
      const hasAdmin = roles.includes('admin');
      const hasModerator = roles.includes('moderator');
      
      setIsAdmin(hasAdmin);
      // Moderator access = admin OR moderator role
      setIsModerator(hasAdmin || hasModerator);
      setUserRole(hasAdmin ? 'admin' : hasModerator ? 'moderator' : 'user');
    } catch (error) {
      console.error('Error checking user role:', error);
      setIsAdmin(false);
      setIsModerator(false);
      setUserRole('user');
    } finally {
      setIsRoleLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      showLogoutSuccessToast();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Combined loading state: wait for both session and role
  const combinedLoading = isLoading || isRoleLoading;

  return (
    <AuthContext.Provider value={{ session, user, isAdmin, isModerator, userRole, isLoading: combinedLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
