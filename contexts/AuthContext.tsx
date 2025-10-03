import {
  signOut as authSignOut,
  getCurrentSession,
  getCurrentUser,
  getUserProfile,
  isAdmin,
  onAuthStateChange,
} from '@/lib/supabase/auth'
import type { AuthSession, AuthUser, User } from '@/types'
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'

interface AuthContextType {
  user: AuthUser | null
  session: AuthSession | null
  profile: User | null
  loading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<AuthSession | null>(null)
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdminUser, setIsAdminUser] = useState(false)

  const refreshProfile = async () => {
    if (user?.id) {
      const userProfile = await getUserProfile(user.id)
      setProfile(userProfile)

      // Check admin status
      const adminStatus = await isAdmin(user.id)
      setIsAdminUser(adminStatus)
    } else {
      setProfile(null)
      setIsAdminUser(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      await authSignOut()
      setUser(null)
      setSession(null)
      setProfile(null)
      setIsAdminUser(false)
    } catch (error) {
      // Handle error silently or show notification
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const initialSession = await getCurrentSession()
        const initialUser = await getCurrentUser()

        setSession(initialSession)
        setUser(initialUser)

        if (initialUser?.id) {
          await refreshProfile()
        }
      } catch (error) {
        // Handle error silently
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user?.id) {
        await refreshProfile()
      } else {
        setProfile(null)
        setIsAdminUser(false)
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    isAuthenticated: !!user,
    isAdmin: isAdminUser,
    signOut,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Hook for protecting pages that require authentication
export function useRequireAuth() {
  const { isAuthenticated, loading } = useAuth()

  return {
    isAuthenticated,
    loading,
    shouldRedirect: !loading && !isAuthenticated,
  }
}

// Hook for admin-only pages
export function useRequireAdmin() {
  const { isAuthenticated, isAdmin, loading } = useAuth()

  return {
    isAuthenticated,
    isAdmin,
    loading,
    shouldRedirect: !loading && (!isAuthenticated || !isAdmin),
  }
}
