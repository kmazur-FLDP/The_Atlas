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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import {
  assignCompanyToProject,
  getAllProjectAccess,
  removeCompanyFromProject,
} from '@/lib/supabase/access'
import { getAllCompanies } from '@/lib/supabase/companies'
import { getAllProjects } from '@/lib/supabase/projects'
import type { Company, Project, ProjectAccess } from '@/types'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

interface ProjectAccessWithDetails extends ProjectAccess {
  project?: Project
  company?: Company
}

function AccessControlContent() {
  const router = useRouter()
  const [access, setAccess] = useState<ProjectAccessWithDetails[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)
  const [selectedCompany, setSelectedCompany] = useState('')
  const [selectedProject, setSelectedProject] = useState('')
  const { toast } = useToast()

  const loadData = async () => {
    setLoading(true)
    const [accessData, companiesData, projectsData] = await Promise.all([
      getAllProjectAccess(),
      getAllCompanies(),
      getAllProjects(),
    ])
    setAccess(accessData)
    setCompanies(companiesData)
    setProjects(projectsData)
    setLoading(false)
  }

  // Load data on mount and whenever we navigate to this page
  useEffect(() => {
    if (router.isReady) {
      loadData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.asPath])

  const handleAssign = async () => {
    if (!selectedCompany || !selectedProject) {
      toast({
        title: 'Error',
        description: 'Please select both a company and a project',
        variant: 'destructive',
      })
      return
    }

    setAdding(true)
    const { error } = await assignCompanyToProject(
      selectedCompany,
      selectedProject
    )

    if (error) {
      toast({ title: 'Error', description: error, variant: 'destructive' })
    } else {
      toast({ title: 'Success', description: 'Access has been granted.' })
      setSelectedCompany('')
      setSelectedProject('')
      loadData()
    }
    setAdding(false)
  }

  const handleRemove = async (
    accessId: string,
    companyName: string,
    projectName: string
  ) => {
    if (!confirm(`Remove ${companyName}'s access to ${projectName}?`)) return

    const accessItem = access.find(a => a.id === accessId)
    if (!accessItem) return

    setRemoving(accessId)
    const { error } = await removeCompanyFromProject(
      accessItem.company_id,
      accessItem.project_id
    )

    if (error) {
      toast({ title: 'Error', description: error, variant: 'destructive' })
    } else {
      toast({ title: 'Success', description: 'Access has been removed.' })
      loadData()
    }
    setRemoving(null)
  }

  // Group access by project
  const accessByProject = projects.map(project => ({
    project,
    companies: access
      .filter(a => a.project_id === project.id)
      .map(a => a.company)
      .filter(Boolean) as Company[],
  }))

  return (
    <AdminLayout>
      <Head>
        <title>Access Control - Admin</title>
      </Head>

      <div>
        <div className='mb-6'>
          <h1 className='text-3xl font-bold text-slate-900'>Access Control</h1>
          <p className='text-slate-600 mt-1'>
            Manage which companies can access which projects
          </p>
        </div>

        {/* Assign Access Card */}
        <Card className='mb-6'>
          <CardHeader>
            <CardTitle>Grant Project Access</CardTitle>
            <CardDescription>
              Assign a company to a project to give their users access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div>
                <label className='block text-sm font-medium text-slate-700 mb-2'>
                  Company
                </label>
                <Select
                  value={selectedCompany}
                  onValueChange={setSelectedCompany}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select company' />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map(company => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className='block text-sm font-medium text-slate-700 mb-2'>
                  Project
                </label>
                <Select
                  value={selectedProject}
                  onValueChange={setSelectedProject}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select project' />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='flex items-end'>
                <Button
                  onClick={handleAssign}
                  disabled={adding || !selectedCompany || !selectedProject}
                  className='w-full'
                >
                  {adding ? (
                    <>
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                      Granting...
                    </>
                  ) : (
                    'Grant Access'
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Access */}
        {loading ? (
          <Card>
            <CardContent className='p-12 text-center'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
              <p className='text-slate-600'>Loading access control...</p>
            </CardContent>
          </Card>
        ) : accessByProject.length === 0 || access.length === 0 ? (
          <Card>
            <CardContent className='p-12 text-center'>
              <h3 className='text-lg font-medium text-slate-900 mb-2'>
                No access configured yet
              </h3>
              <p className='text-slate-600'>
                Use the form above to grant company access to projects.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className='space-y-4'>
            {accessByProject.map(
              ({ project, companies: projectCompanies }) =>
                projectCompanies.length > 0 && (
                  <Card key={project.id}>
                    <CardHeader>
                      <CardTitle className='text-lg'>{project.name}</CardTitle>
                      <CardDescription>
                        {project.description || 'No description'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className='space-y-2'>
                        {projectCompanies.map(company => {
                          const accessItem = access.find(
                            a =>
                              a.project_id === project.id &&
                              a.company_id === company.id
                          )
                          return (
                            <div
                              key={company.id}
                              className='flex items-center justify-between p-3 bg-slate-50 rounded-md'
                            >
                              <div>
                                <div className='font-medium text-slate-900'>
                                  {company.name}
                                </div>
                                <div className='text-sm text-slate-500'>
                                  Granted{' '}
                                  {accessItem
                                    ? new Date(
                                        accessItem.created_at
                                      ).toLocaleDateString()
                                    : ''}
                                </div>
                              </div>
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() =>
                                  accessItem &&
                                  handleRemove(
                                    accessItem.id,
                                    company.name,
                                    project.name
                                  )
                                }
                                disabled={
                                  !accessItem || removing === accessItem.id
                                }
                                className='text-red-600 hover:text-red-700 hover:bg-red-50'
                              >
                                {accessItem && removing === accessItem.id ? (
                                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-red-600'></div>
                                ) : (
                                  'Remove'
                                )}
                              </Button>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default function AccessControlPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AccessControlContent />
    </ProtectedRoute>
  )
}
