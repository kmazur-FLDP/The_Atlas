import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { deleteMap, getAllMaps, toggleMapStatus } from '@/lib/supabase/maps'
import { getAllProjects } from '@/lib/supabase/projects'
import type { Map, Project } from '@/types'
import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'

function MapsContent() {
  const [maps, setMaps] = useState<Map[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const { toast } = useToast()

  const loadData = async () => {
    setLoading(true)
    const [mapsData, projectsData] = await Promise.all([
      getAllMaps(),
      getAllProjects(),
    ])
    setMaps(mapsData)
    setProjects(projectsData)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return

    setDeleting(id)
    const { error } = await deleteMap(id)

    if (error) {
      toast({ title: 'Error', description: error, variant: 'destructive' })
    } else {
      toast({
        title: 'Success',
        description: `Map "${name}" has been deleted.`,
      })
      loadData()
    }
    setDeleting(null)
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await toggleMapStatus(id, !currentStatus)
    if (error) {
      toast({ title: 'Error', description: error, variant: 'destructive' })
    } else {
      loadData()
    }
  }

  const getProjectName = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.name || 'Unknown'
  }

  return (
    <AdminLayout>
      <Head>
        <title>Manage Maps - Admin</title>
      </Head>

      <div>
        <div className='flex justify-between items-center mb-6'>
          <div>
            <h1 className='text-3xl font-bold text-slate-900'>Maps</h1>
            <p className='text-slate-600 mt-1'>
              Manage map metadata and configurations
            </p>
          </div>
          <Link href='/admin/maps/new'>
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
              Add Map
            </Button>
          </Link>
        </div>

        {loading ? (
          <Card>
            <CardContent className='p-12 text-center'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
              <p className='text-slate-600'>Loading maps...</p>
            </CardContent>
          </Card>
        ) : maps.length === 0 ? (
          <Card>
            <CardContent className='p-12 text-center'>
              <h3 className='text-lg font-medium text-slate-900 mb-2'>
                No maps yet
              </h3>
              <p className='text-slate-600 mb-4'>
                Create your first map to get started.
              </p>
              <Link href='/admin/maps/new'>
                <Button>Add Map</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-slate-50 border-b'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase'>
                      Name
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase'>
                      Project
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase'>
                      URL Slug
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase'>
                      Active
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-slate-200'>
                  {maps.map(map => (
                    <tr key={map.id} className='hover:bg-slate-50'>
                      <td className='px-6 py-4'>
                        <div className='text-sm font-medium text-slate-900'>
                          {map.name}
                        </div>
                        {map.description && (
                          <div className='text-sm text-slate-500 truncate max-w-xs'>
                            {map.description}
                          </div>
                        )}
                      </td>
                      <td className='px-6 py-4 text-sm text-slate-600'>
                        {getProjectName(map.project_id)}
                      </td>
                      <td className='px-6 py-4'>
                        <code className='text-xs bg-slate-100 px-2 py-1 rounded'>
                          /maps/{map.url_slug}
                        </code>
                      </td>
                      <td className='px-6 py-4'>
                        <Switch
                          checked={map.is_active}
                          onCheckedChange={() =>
                            handleToggleStatus(map.id, map.is_active)
                          }
                        />
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex space-x-2'>
                          <Link href={`/admin/maps/${map.id}`}>
                            <Button variant='outline' size='sm'>
                              Edit
                            </Button>
                          </Link>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleDelete(map.id, map.name)}
                            disabled={deleting === map.id}
                            className='text-red-600 hover:bg-red-50'
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}

export default function MapsPage() {
  return (
    <ProtectedRoute requireAdmin>
      <MapsContent />
    </ProtectedRoute>
  )
}
