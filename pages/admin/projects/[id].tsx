import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import {
  assignCompanyToProject,
  getProjectCompanies,
  removeCompanyFromProject,
} from '@/lib/supabase/access'
import { getAllCompanies } from '@/lib/supabase/companies'
import { getProjectById, updateProject } from '@/lib/supabase/projects'
import { getAllUsers } from '@/lib/supabase/users'
import type { Company, Project, User } from '@/types'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'

function EditProjectContent() {
  const router = useRouter()
  const { id } = router.query
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [project, setProject] = useState<Project | null>(null)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [errors, setErrors] = useState<{ name?: string }>({})

  // Company assignment state
  const [allCompanies, setAllCompanies] = useState<Company[]>([])
  const [assignedCompanies, setAssignedCompanies] = useState<Company[]>([])
  const [assigningCompany, setAssigningCompany] = useState(false)
  const [removingCompanyId, setRemovingCompanyId] = useState<string | null>(
    null
  )
  const [selectedCompanyId, setSelectedCompanyId] = useState('')

  // User display state (for reference)
  const [allUsers, setAllUsers] = useState<User[]>([])

  const loadProjectData = useCallback(
    async (projectId: string) => {
      setLoading(true)
      try {
        const [projectData, companies, assignedComps, users] =
          await Promise.all([
            getProjectById(projectId),
            getAllCompanies(),
            getProjectCompanies(projectId),
            getAllUsers(),
          ])

        if (!projectData) {
          toast({
            title: 'Error',
            description: 'Project not found',
            variant: 'destructive',
          })
          router.push('/admin/projects')
          return
        }

        setProject(projectData)
        setFormData({
          name: projectData.name,
          description: projectData.description || '',
        })
        setAllCompanies(companies)
        setAssignedCompanies(assignedComps)
        setAllUsers(users)
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load project data',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    },
    [toast, router]
  )

  useEffect(() => {
    if (id && typeof id === 'string') {
      loadProjectData(id)
    }
  }, [id, loadProjectData])

  const validate = () => {
    const newErrors: { name?: string } = {}
    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate() || !project) return

    setSaving(true)
    const { error } = await updateProject(project.id, {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
    })

    if (error) {
      toast({ title: 'Error', description: error, variant: 'destructive' })
      setSaving(false)
    } else {
      toast({
        title: 'Success',
        description: `Project "${formData.name}" has been updated.`,
      })
      router.push('/admin/projects')
    }
  }

  const handleAssignCompany = async () => {
    if (!selectedCompanyId || !project) return

    setAssigningCompany(true)
    const { error } = await assignCompanyToProject(
      selectedCompanyId,
      project.id
    )

    if (error) {
      toast({ title: 'Error', description: error, variant: 'destructive' })
    } else {
      toast({
        title: 'Success',
        description: 'Company assigned to project',
      })
      // Reload assigned companies
      const updatedAssignedCompanies = await getProjectCompanies(project.id)
      setAssignedCompanies(updatedAssignedCompanies)
      setSelectedCompanyId('')
    }
    setAssigningCompany(false)
  }

  const handleRemoveCompany = async (
    companyId: string,
    companyName: string
  ) => {
    if (!project) return
    if (!confirm(`Remove "${companyName}" from this project?`)) return

    setRemovingCompanyId(companyId)
    const { error } = await removeCompanyFromProject(companyId, project.id)

    if (error) {
      toast({ title: 'Error', description: error, variant: 'destructive' })
    } else {
      toast({
        title: 'Success',
        description: 'Company removed from project',
      })
      // Reload assigned companies
      const updatedAssignedCompanies = await getProjectCompanies(project.id)
      setAssignedCompanies(updatedAssignedCompanies)
    }
    setRemovingCompanyId(null)
  }

  // Get available companies (not yet assigned)
  const availableCompanies = allCompanies.filter(
    company => !assignedCompanies.some(ac => ac.id === company.id)
  )

  // Get users from assigned companies
  const companyUserCounts = assignedCompanies.map(company => {
    const userCount = allUsers.filter(
      user => user.company_id === company.id
    ).length
    return { company, userCount }
  })

  if (loading) {
    return (
      <AdminLayout>
        <Card>
          <CardContent className='p-12 text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
            <p className='text-slate-600'>Loading project...</p>
          </CardContent>
        </Card>
      </AdminLayout>
    )
  }

  if (!project) {
    return null
  }

  return (
    <AdminLayout>
      <Head>
        <title>Edit Project - Admin</title>
      </Head>

      <div className='max-w-4xl'>
        <div className='mb-6'>
          <h1 className='text-3xl font-bold text-slate-900'>Edit Project</h1>
          <p className='text-slate-600 mt-1'>
            Update project details and manage access
          </p>
        </div>

        <div className='space-y-6'>
          {/* Project Information */}
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
              <CardDescription>
                Basic details about this project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className='space-y-4'>
                <div>
                  <Label htmlFor='name'>
                    Project Name <span className='text-red-500'>*</span>
                  </Label>
                  <Input
                    id='name'
                    value={formData.name}
                    onChange={e =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder='e.g., Downtown Development'
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className='text-sm text-red-600 mt-1'>{errors.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor='description'>Description</Label>
                  <textarea
                    id='description'
                    value={formData.description}
                    onChange={e =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder='Brief description of the project...'
                    rows={4}
                    className='w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                </div>

                <div className='flex justify-end space-x-3 pt-4'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => router.push('/admin/projects')}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button type='submit' disabled={saving}>
                    {saving ? (
                      <>
                        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Company Access */}
          <Card>
            <CardHeader>
              <CardTitle>Company Access</CardTitle>
              <CardDescription>
                Manage which companies can access this project
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              {/* Assign new company */}
              <div className='flex gap-3'>
                <div className='flex-1'>
                  <Label htmlFor='company-select'>Assign Company</Label>
                  <select
                    id='company-select'
                    value={selectedCompanyId}
                    onChange={e => setSelectedCompanyId(e.target.value)}
                    className='w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    disabled={
                      assigningCompany || availableCompanies.length === 0
                    }
                  >
                    <option value=''>
                      {availableCompanies.length === 0
                        ? 'All companies assigned'
                        : 'Select a company...'}
                    </option>
                    {availableCompanies.map(company => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className='flex items-end'>
                  <Button
                    onClick={handleAssignCompany}
                    disabled={
                      !selectedCompanyId ||
                      assigningCompany ||
                      availableCompanies.length === 0
                    }
                  >
                    {assigningCompany ? (
                      <>
                        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                        Assigning...
                      </>
                    ) : (
                      'Assign'
                    )}
                  </Button>
                </div>
              </div>

              {/* Assigned companies list */}
              <div>
                <Label>Assigned Companies ({assignedCompanies.length})</Label>
                {assignedCompanies.length === 0 ? (
                  <div className='text-sm text-slate-500 mt-2 p-4 bg-slate-50 rounded-md text-center'>
                    No companies assigned yet. Assign a company to grant access
                    to this project.
                  </div>
                ) : (
                  <div className='mt-2 space-y-2'>
                    {companyUserCounts.map(({ company, userCount }) => (
                      <div
                        key={company.id}
                        className='flex items-center justify-between p-3 bg-slate-50 rounded-md'
                      >
                        <div>
                          <p className='font-medium text-slate-900'>
                            {company.name}
                          </p>
                          <p className='text-sm text-slate-500'>
                            {userCount} {userCount === 1 ? 'user' : 'users'} in
                            this company
                          </p>
                        </div>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() =>
                            handleRemoveCompany(company.id, company.name)
                          }
                          disabled={removingCompanyId === company.id}
                          className='text-red-600 hover:text-red-700 hover:bg-red-50'
                        >
                          {removingCompanyId === company.id ? (
                            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-red-600'></div>
                          ) : (
                            'Remove'
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* User Access Info */}
          <Card>
            <CardHeader>
              <CardTitle>User Access</CardTitle>
              <CardDescription>
                Users gain access to projects through their company assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {assignedCompanies.length === 0 ? (
                <div className='text-sm text-slate-500 p-4 bg-slate-50 rounded-md text-center'>
                  No users have access yet. Assign companies above to grant
                  access to their users.
                </div>
              ) : (
                <div className='space-y-4'>
                  {assignedCompanies.map(company => {
                    const companyUsers = allUsers.filter(
                      user => user.company_id === company.id
                    )
                    return (
                      <div key={company.id}>
                        <h4 className='font-medium text-slate-900 mb-2'>
                          {company.name}
                        </h4>
                        {companyUsers.length === 0 ? (
                          <p className='text-sm text-slate-500 ml-4'>
                            No users in this company
                          </p>
                        ) : (
                          <ul className='space-y-1 ml-4'>
                            {companyUsers.map(user => (
                              <li
                                key={user.id}
                                className='text-sm text-slate-600'
                              >
                                • {user.name || user.email}
                                {user.is_admin && (
                                  <span className='ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded'>
                                    Admin
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}

export default function EditProjectPage() {
  return (
    <ProtectedRoute requireAdmin>
      <EditProjectContent />
    </ProtectedRoute>
  )
}
