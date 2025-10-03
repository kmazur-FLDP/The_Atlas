import type { AuthSession, AuthUser, User } from '@/types'
import { supabase } from './client'

export interface AuthResponse {
  user: AuthUser | null
  session: AuthSession | null
  error: string | null
}

export interface SignInCredentials {
  email: string
  password: string
}

export interface SignUpCredentials {
  email: string
  password: string
  userData?: {
    company_id?: string
    [key: string]: any
  }
}

/**
 * Sign in with email and password
 */
export async function signIn(
  credentials: SignInCredentials
): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    })

    if (error) {
      return {
        user: null,
        session: null,
        error: error.message,
      }
    }

    return {
      user: data.user,
      session: data.session,
      error: null,
    }
  } catch (error) {
    return {
      user: null,
      session: null,
      error: 'An unexpected error occurred during sign in',
    }
  }
}

/**
 * Sign up new user with email and password
 */
export async function signUp(
  credentials: SignUpCredentials
): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: credentials.userData || {},
      },
    })

    if (error) {
      return {
        user: null,
        session: null,
        error: error.message,
      }
    }

    return {
      user: data.user,
      session: data.session,
      error: null,
    }
  } catch (error) {
    return {
      user: null,
      session: null,
      error: 'An unexpected error occurred during sign up',
    }
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      return { error: error.message }
    }

    return { error: null }
  } catch (error) {
    return { error: 'An unexpected error occurred during sign out' }
  }
}

/**
 * Get current session
 */
export async function getCurrentSession(): Promise<AuthSession | null> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error('Error getting session:', error)
    return null
  }
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}

/**
 * Get user profile data from database
 */
export async function getUserProfile(userId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(
        `
        *,
        company:companies(*)
      `
      )
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<User>
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)

    if (error) {
      return { error: error.message }
    }

    return { error: null }
  } catch (error) {
    return { error: 'An unexpected error occurred while updating profile' }
  }
}

/**
 * Reset password
 */
export async function resetPassword(
  email: string
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      return { error: error.message }
    }

    return { error: null }
  } catch (error) {
    return { error: 'An unexpected error occurred while resetting password' }
  }
}

/**
 * Update password
 */
export async function updatePassword(
  newPassword: string
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      return { error: error.message }
    }

    return { error: null }
  } catch (error) {
    return { error: 'An unexpected error occurred while updating password' }
  }
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(
  callback: (event: string, session: AuthSession | null) => void
) {
  return supabase.auth.onAuthStateChange(callback)
}

/**
 * Check if user has admin privileges
 */
export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single()

    if (error || !data) {
      return false
    }

    // Add your admin email logic here
    // For now, you can hardcode admin emails or add an admin role to the database
    const adminEmails = [
      'admin@yourdomain.com',
      // Add your admin emails here
    ]

    return adminEmails.includes(data.email)
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}
