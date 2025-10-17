import type { Project } from '@/types'
import { supabase } from './client'

export interface CreateProjectInput {
  name: string
  description?: string
}

export interface UpdateProjectInput {
  name?: string
  description?: string
}

/**
 * Get all projects (admin only)
 */
export async function getAllProjects(): Promise<Project[]> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('name')

    if (error) throw error
    return data || []
  } catch (error) {
    return []
  }
}

/**
 * Get a single project by ID
 */
export async function getProjectById(id: string): Promise<Project | null> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(
        `
        *,
        maps:maps(*)
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
 * Create a new project
 */
export async function createProject(
  input: CreateProjectInput
): Promise<{ data: Project | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('projects')
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
      error: 'An unexpected error occurred while creating the project',
    }
  }
}

/**
 * Update a project
 */
export async function updateProject(
  id: string,
  input: UpdateProjectInput
): Promise<{ data: Project | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('projects')
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
      error: 'An unexpected error occurred while updating the project',
    }
  }
}

/**
 * Delete a project
 */
export async function deleteProject(
  id: string
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.from('projects').delete().eq('id', id)

    if (error) {
      return { error: error.message }
    }

    return { error: null }
  } catch (error) {
    return {
      error: 'An unexpected error occurred while deleting the project',
    }
  }
}

/**
 * Get user's accessible projects
 */
export async function getUserProjects(userId: string): Promise<Project[]> {
  try {
    const { data, error } = await supabase.rpc('get_user_projects', {
      user_id: userId,
    })

    if (error) throw error
    return data || []
  } catch (error) {
    return []
  }
}

/**
 * Get projects with stats (map count, company count)
 */
export async function getProjectsWithStats(): Promise<
  Array<Project & { map_count: number; company_count: number }>
> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(
        `
        *,
        maps:maps(count),
        project_access:project_access(count)
      `
      )
      .order('name')

    if (error) throw error

    return (
      data?.map(project => ({
        ...project,
        map_count: project.maps?.[0]?.count || 0,
        company_count: project.project_access?.[0]?.count || 0,
      })) || []
    )
  } catch (error) {
    return []
  }
}
