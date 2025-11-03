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
import { useToast } from '@/hooks/use-toast'
import { deleteProject, getProjectsWithStats } from '@/lib/supabase/projects'
import type { Project } from '@/types'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

function ProjectsContent() {
  const router = useRouter()
  const [projects, setProjects] = useState<
    Array<Project & { map_count: number; company_count: number }>
  >([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const { toast } = useToast()

  const loadProjects = async () => {
    setLoading(true)
    const data = await getProjectsWithStats()
    setProjects(data)
    setLoading(false)
  }

  // Load data on mount and whenever we navigate to this page
  useEffect(() => {
    if (router.isReady) {
      loadProjects()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.asPath])

  const handleDelete = async (id: string, name: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${name}"? This will also delete all associated maps.`
      )
    ) {
      return
    }

    setDeleting(id)
    const { error } = await deleteProject(id)

    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Success',
        description: `Project "${name}" has been deleted.`,
      })
      loadProjects()
    }
    setDeleting(null)
  }

  return (
    <AdminLayout>
      <Head>
        <title>Manage Projects - Admin</title>
      </Head>

      <div>
        <div className='flex justify-between items-center mb-6'>
          <div>
            <h1 className='text-3xl font-bold text-slate-900'>Projects</h1>
            <p className='text-slate-600 mt-1'>
              Manage mapping projects and collections
            </p>
          </div>
          <Link href='/admin/projects/new'>
            <Button>
              <svg
                className='w-4 h-4 mr-2'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 4v16m8-8H4'
                />
              </svg>
              Add Project
            </Button>
          </Link>
        </div>

        {loading ? (
          <Card>
            <CardContent className='p-12 text-center'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
              <p className='text-slate-600'>Loading projects...</p>
            </CardContent>
          </Card>
        ) : projects.length === 0 ? (
          <Card>
            <CardContent className='p-12 text-center'>
              <div className='w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center'>
                <svg
                  className='w-8 h-8 text-slate-400'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z'
                  />
                </svg>
              </div>
              <h3 className='text-lg font-medium text-slate-900 mb-2'>
                No projects yet
              </h3>
              <p className='text-slate-600 mb-4'>
                Get started by creating your first project.
              </p>
              <Link href='/admin/projects/new'>
                <Button>Add Project</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className='space-y-4'>
            {projects.map(project => (
              <Card key={project.id}>
                <CardHeader>
                  <div className='flex justify-between items-start'>
                    <div className='flex-1'>
                      <CardTitle>{project.name}</CardTitle>
                      {project.description && (
                        <CardDescription className='mt-2'>
                          {project.description}
                        </CardDescription>
                      )}
                      <div className='flex space-x-4 mt-3'>
                        <span className='text-sm text-slate-500'>
                          {project.map_count}{' '}
                          {project.map_count === 1 ? 'map' : 'maps'}
                        </span>
                        <span className='text-sm text-slate-500'>
                          {project.company_count}{' '}
                          {project.company_count === 1
                            ? 'company'
                            : 'companies'}
                        </span>
                        <span className='text-sm text-slate-500'>
                          Created{' '}
                          {new Date(project.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className='flex space-x-2 ml-4'>
                      <Link href={`/admin/projects/${project.id}`}>
                        <Button variant='outline' size='sm'>
                          <svg
                            className='w-4 h-4 mr-2'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                            />
                          </svg>
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleDelete(project.id, project.name)}
                        disabled={deleting === project.id}
                        className='text-red-600 hover:text-red-700 hover:bg-red-50'
                      >
                        {deleting === project.id ? (
                          <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-red-600'></div>
                        ) : (
                          <svg
                            className='w-4 h-4'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                            />
                          </svg>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default function ProjectsPage() {
  return (
    <ProtectedRoute requireAdmin>
      <ProjectsContent />
    </ProtectedRoute>
  )
}
