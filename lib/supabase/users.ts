import type { User } from '@/types'
import { supabase } from './client'

export interface UpdateUserInput {
  company_id?: string | null
  is_admin?: boolean
}

/**
 * Get all users with their company info (admin only)
 */
export async function getAllUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(
        `
        *,
        company:companies(*)
      `
      )
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    return []
  }
}

/**
 * Get a single user by ID
 */
export async function getUserById(id: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(
        `
        *,
        company:companies(*)
      `
      )
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    return null
  }
}

/**
 * Update a user
 */
export async function updateUser(
  id: string,
  input: UpdateUserInput
): Promise<{ data: User | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(input)
      .eq('id', id)
      .select(
        `
        *,
        company:companies(*)
      `
      )
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error) {
    return {
      data: null,
      error: 'An unexpected error occurred while updating the user',
    }
  }
}

/**
 * Delete a user (careful - this removes from auth.users too)
 */
export async function deleteUser(
  id: string
): Promise<{ error: string | null }> {
  try {
    // Note: This requires the service role key
    // For now, we'll just remove from public.users
    // The auth.users entry will cascade delete via foreign key
    const { error } = await supabase.from('users').delete().eq('id', id)

    if (error) {
      return { error: error.message }
    }

    return { error: null }
  } catch (error) {
    return {
      error: 'An unexpected error occurred while deleting the user',
    }
  }
}

/**
 * Assign user to company
 */
export async function assignUserToCompany(
  userId: string,
  companyId: string | null
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('users')
      .update({ company_id: companyId })
      .eq('id', userId)

    if (error) {
      return { error: error.message }
    }

    return { error: null }
  } catch (error) {
    return {
      error: 'An unexpected error occurred while assigning the user',
    }
  }
}

/**
 * Toggle admin status
 */
export async function toggleAdminStatus(
  userId: string,
  isAdmin: boolean
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('users')
      .update({ is_admin: isAdmin })
      .eq('id', userId)

    if (error) {
      return { error: error.message }
    }

    return { error: null }
  } catch (error) {
    return {
      error: 'An unexpected error occurred while updating admin status',
    }
  }
}

/**
 * Get users by company
 */
export async function getUsersByCompany(companyId: string): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(
        `
        *,
        company:companies(*)
      `
      )
      .eq('company_id', companyId)
      .order('email')

    if (error) throw error
    return data || []
  } catch (error) {
    return []
  }
}
