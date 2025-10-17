import type { Map } from '@/types'
import { supabase } from './client'

export interface CreateMapInput {
  project_id: string
  name: string
  url_slug: string
  description?: string
  thumbnail_url?: string
  sort_order?: number
  is_active?: boolean
}

export interface UpdateMapInput {
  name?: string
  url_slug?: string
  description?: string
  thumbnail_url?: string
  sort_order?: number
  is_active?: boolean
}

/**
 * Get all maps (admin only)
 */
export async function getAllMaps(): Promise<Map[]> {
  try {
    const { data, error } = await supabase
      .from('maps')
      .select(
        `
        *,
        project:projects(*)
      `
      )
      .order('project_id')
      .order('sort_order')

    if (error) throw error
    return data || []
  } catch (error) {
    return []
  }
}

/**
 * Get maps by project
 */
export async function getMapsByProject(projectId: string): Promise<Map[]> {
  try {
    const { data, error } = await supabase
      .from('maps')
      .select('*')
      .eq('project_id', projectId)
      .order('sort_order')

    if (error) throw error
    return data || []
  } catch (error) {
    return []
  }
}

/**
 * Get a single map by ID
 */
export async function getMapById(id: string): Promise<Map | null> {
  try {
    const { data, error } = await supabase
      .from('maps')
      .select(
        `
        *,
        project:projects(*)
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
 * Get a map by URL slug
 */
export async function getMapBySlug(slug: string): Promise<Map | null> {
  try {
    const { data, error } = await supabase
      .from('maps')
      .select(
        `
        *,
        project:projects(*)
      `
      )
      .eq('url_slug', slug)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    return null
  }
}

/**
 * Create a new map
 */
export async function createMap(
  input: CreateMapInput
): Promise<{ data: Map | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('maps')
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
      error: 'An unexpected error occurred while creating the map',
    }
  }
}

/**
 * Update a map
 */
export async function updateMap(
  id: string,
  input: UpdateMapInput
): Promise<{ data: Map | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('maps')
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
      error: 'An unexpected error occurred while updating the map',
    }
  }
}

/**
 * Delete a map
 */
export async function deleteMap(id: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.from('maps').delete().eq('id', id)

    if (error) {
      return { error: error.message }
    }

    return { error: null }
  } catch (error) {
    return {
      error: 'An unexpected error occurred while deleting the map',
    }
  }
}

/**
 * Get user's accessible maps
 */
export async function getUserMaps(userId: string): Promise<Map[]> {
  try {
    const { data, error } = await supabase.rpc('get_user_maps', {
      user_id: userId,
    })

    if (error) throw error
    return data || []
  } catch (error) {
    return []
  }
}

/**
 * Toggle map active status
 */
export async function toggleMapStatus(
  id: string,
  isActive: boolean
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('maps')
      .update({ is_active: isActive })
      .eq('id', id)

    if (error) {
      return { error: error.message }
    }

    return { error: null }
  } catch (error) {
    return {
      error: 'An unexpected error occurred while updating map status',
    }
  }
}
