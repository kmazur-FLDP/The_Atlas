import type { Company } from '@/types'
import { supabase } from './client'

export interface CreateCompanyInput {
  name: string
}

export interface UpdateCompanyInput {
  name?: string
}

/**
 * Get all companies (admin only)
 */
export async function getAllCompanies(): Promise<Company[]> {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('name')

    if (error) throw error
    return data || []
  } catch (error) {
    return []
  }
}

/**
 * Get a single company by ID
 */
export async function getCompanyById(id: string): Promise<Company | null> {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    return null
  }
}

/**
 * Create a new company
 */
export async function createCompany(
  input: CreateCompanyInput
): Promise<{ data: Company | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('companies')
      .insert([input])
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error) {
    return {
      data: null,
      error: 'An unexpected error occurred while creating the company',
    }
  }
}

/**
 * Update a company
 */
export async function updateCompany(
  id: string,
  input: UpdateCompanyInput
): Promise<{ data: Company | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('companies')
      .update(input)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error) {
    return {
      data: null,
      error: 'An unexpected error occurred while updating the company',
    }
  }
}

/**
 * Delete a company
 */
export async function deleteCompany(
  id: string
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.from('companies').delete().eq('id', id)

    if (error) {
      return { error: error.message }
    }

    return { error: null }
  } catch (error) {
    return {
      error: 'An unexpected error occurred while deleting the company',
    }
  }
}

/**
 * Get companies with user count
 */
export async function getCompaniesWithStats(): Promise<
  Array<Company & { user_count: number }>
> {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select(
        `
        *,
        users:users(count)
      `
      )
      .order('name')

    if (error) throw error

    return (
      data?.map(company => ({
        ...company,
        user_count: company.users?.[0]?.count || 0,
      })) || []
    )
  } catch (error) {
    return []
  }
}
