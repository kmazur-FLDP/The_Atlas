import type { Company, Project, ProjectAccess } from '@/types'
import { supabase } from './client'

export interface ProjectAccessWithDetails extends ProjectAccess {
  project?: Project
  company?: Company
}

/**
 * Get all project access assignments
 */
export async function getAllProjectAccess(): Promise<
  ProjectAccessWithDetails[]
> {
  try {
    const { data, error } = await supabase
      .from('project_access')
      .select(
        `
        *,
        project:projects(*),
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
 * Get companies assigned to a project
 */
export async function getProjectCompanies(
  projectId: string
): Promise<Company[]> {
  try {
    const { data, error } = await supabase
      .from('project_access')
      .select(
        `
        company:companies(*)
      `
      )
      .eq('project_id', projectId)

    if (error) throw error
    return data?.map(item => item.company).filter(Boolean) || []
  } catch (error) {
    return []
  }
}

/**
 * Get projects assigned to a company
 */
export async function getCompanyProjects(
  companyId: string
): Promise<Project[]> {
  try {
    const { data, error } = await supabase
      .from('project_access')
      .select(
        `
        project:projects(*)
      `
      )
      .eq('company_id', companyId)

    if (error) throw error
    return data?.map(item => item.project).filter(Boolean) || []
  } catch (error) {
    return []
  }
}

/**
 * Assign a company to a project
 */
export async function assignCompanyToProject(
  companyId: string,
  projectId: string
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('project_access')
      .insert([{ company_id: companyId, project_id: projectId }])

    if (error) {
      // Check if it's a unique constraint violation
      if (error.code === '23505') {
        return { error: 'This company is already assigned to this project' }
      }
      return { error: error.message }
    }

    return { error: null }
  } catch (error) {
    return {
      error: 'An unexpected error occurred while assigning access',
    }
  }
}

/**
 * Remove company access from a project
 */
export async function removeCompanyFromProject(
  companyId: string,
  projectId: string
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('project_access')
      .delete()
      .eq('company_id', companyId)
      .eq('project_id', projectId)

    if (error) {
      return { error: error.message }
    }

    return { error: null }
  } catch (error) {
    return {
      error: 'An unexpected error occurred while removing access',
    }
  }
}

/**
 * Check if a company has access to a project
 */
export async function hasProjectAccess(
  companyId: string,
  projectId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('project_access')
      .select('id')
      .eq('company_id', companyId)
      .eq('project_id', projectId)
      .single()

    if (error) return false
    return !!data
  } catch (error) {
    return false
  }
}

/**
 * Bulk assign companies to a project
 */
export async function bulkAssignCompaniesToProject(
  companyIds: string[],
  projectId: string
): Promise<{ error: string | null }> {
  try {
    const inserts = companyIds.map(companyId => ({
      company_id: companyId,
      project_id: projectId,
    }))

    const { error } = await supabase.from('project_access').insert(inserts)

    if (error) {
      return { error: error.message }
    }

    return { error: null }
  } catch (error) {
    return {
      error: 'An unexpected error occurred while assigning access',
    }
  }
}

/**
 * Remove all company access from a project
 */
export async function removeAllCompaniesFromProject(
  projectId: string
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('project_access')
      .delete()
      .eq('project_id', projectId)

    if (error) {
      return { error: error.message }
    }

    return { error: null }
  } catch (error) {
    return {
      error: 'An unexpected error occurred while removing access',
    }
  }
}
