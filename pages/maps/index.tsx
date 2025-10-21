import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'
import type { Map as MapType } from '@/types'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

interface MapWithProject extends MapType {
  project?: {
    id: string
    name: string
    created_at: string
  }
}

function MapsContent() {
  const { profile } = useAuth()
  const [maps, setMaps] = useState<MapWithProject[]>([])
  const [loading, setLoading] = useState(true)
  const [groupBy, setGroupBy] = useState<'all' | 'project'>('project')

  const loadMaps = useCallback(async () => {
    if (!profile) return

    setLoading(true)
    try {
      if (profile.is_admin) {
        // Admins see all active maps
        const { data, error } = await supabase
          .from('maps')
          .select(
            `
            *,
            project:projects(id, name, created_at)
          `
          )
          .eq('is_active', true)
          .order('project_id')
          .order('sort_order')

        if (!error && data) {
          setMaps(data)
        }
      } else {
        // Regular users see maps from their company's projects
        // First get company's projects
        const { data: accessData, error: accessError } = await supabase
          .from('project_access')
          .select('project_id')
          .eq('company_id', profile.company_id)

        if (accessError || !accessData) {
          setMaps([])
          setLoading(false)
          return
        }

        const projectIds = accessData.map(a => a.project_id)

        if (projectIds.length === 0) {
          setMaps([])
          setLoading(false)
          return
        }

        // Get maps from those projects
        const { data, error } = await supabase
          .from('maps')
          .select(
            `
            *,
            project:projects(id, name, created_at)
          `
          )
          .in('project_id', projectIds)
          .eq('is_active', true)
          .order('project_id')
          .order('sort_order')

        if (!error && data) {
          setMaps(data)
        }
      }
    } catch (error) {
      // Error loading maps
    } finally {
      setLoading(false)
    }
  }, [profile])

  useEffect(() => {
    if (profile) {
      loadMaps()
    }
  }, [profile, loadMaps])

  // Group maps by project
  const mapsByProject = maps.reduce(
    (acc, map) => {
      const projectId = map.project_id
      if (!acc[projectId]) {
        acc[projectId] = {
          project: map.project,
          maps: [],
        }
      }
      acc[projectId].maps.push(map)
      return acc
    },
    {} as Record<
      string,
      { project?: { id: string; name: string }; maps: MapWithProject[] }
    >
  )

  return (
    <MainLayout>
      <Head>
        <title>Maps - The Atlas</title>
      </Head>

      <div className='px-6 py-8 mx-auto max-w-7xl'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-4'>
            <div>
              <h1 className='text-4xl font-bold text-slate-900 leading-relaxed'>
                Maps
              </h1>
              <p className='mt-2 text-slate-600 leading-relaxed'>
                Browse and explore all available mapping experiences
              </p>
            </div>
            {maps.length > 0 && (
              <div className='flex gap-2'>
                <button
                  onClick={() => setGroupBy('project')}
                  className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                    groupBy === 'project'
                      ? 'bg-brand-primary text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  By Project
                </button>
                <button
                  onClick={() => setGroupBy('all')}
                  className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                    groupBy === 'all'
                      ? 'bg-brand-primary text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  All Maps
                </button>
              </div>
            )}
          </div>
          {!loading && (
            <div className='px-4 py-2 text-sm rounded-xl bg-neutral-50 text-slate-600 w-fit'>
              {maps.length} {maps.length === 1 ? 'map' : 'maps'} available
            </div>
          )}
        </div>

        {/* Loading state */}
        {loading && (
          <Card>
            <CardContent className='p-12 text-center'>
              <div className='w-8 h-8 mx-auto mb-4 border-b-2 rounded-full animate-spin border-brand-primary'></div>
              <p className='text-slate-600'>Loading maps...</p>
            </CardContent>
          </Card>
        )}

        {/* Empty state */}
        {!loading && maps.length === 0 && (
          <Card>
            <CardContent className='p-12 text-center'>
              <div className='flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100'>
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
                    d='M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7'
                  />
                </svg>
              </div>
              <h3 className='mb-2 text-lg font-bold text-slate-700'>
                No maps available
              </h3>
              <p className='text-slate-500'>
                {profile?.is_admin
                  ? 'Create maps in the admin panel to get started.'
                  : 'Contact your administrator to get access to maps.'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Maps grid - grouped by project */}
        {!loading && maps.length > 0 && groupBy === 'project' && (
          <div className='space-y-8'>
            {Object.values(mapsByProject).map(
              ({ project, maps: projectMaps }) => (
                <div key={project?.id || 'unknown'}>
                  <h2 className='mb-4 text-2xl font-bold text-slate-800'>
                    {project?.name || 'Unknown Project'}
                  </h2>
                  <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                    {projectMaps.map(map => (
                      <MapCard key={map.id} map={map} />
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* Maps grid - all maps */}
        {!loading && maps.length > 0 && groupBy === 'all' && (
          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {maps.map(map => (
              <MapCard key={map.id} map={map} showProject />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}

interface MapCardProps {
  map: MapWithProject
  showProject?: boolean
}

function MapCard({ map, showProject }: MapCardProps) {
  return (
    <Link href={`/maps/${map.url_slug}`}>
      <Card className='overflow-hidden transition-all duration-200 border shadow-sm cursor-pointer group hover:shadow-md border-slate-200 rounded-2xl'>
        <div className='relative h-48 overflow-hidden bg-slate-100'>
          {map.thumbnail_url ? (
            <Image
              src={map.thumbnail_url}
              alt={map.name}
              fill
              className='object-cover transition-transform duration-200 group-hover:scale-105'
            />
          ) : (
            <div className='flex items-center justify-center h-full text-slate-400'>
              <svg
                className='w-16 h-16'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7'
                />
              </svg>
            </div>
          )}
        </div>
        <CardContent className='p-4'>
          <h3 className='mb-2 text-lg font-bold text-slate-900'>{map.name}</h3>
          {map.description && (
            <p className='mb-3 text-sm text-slate-600 line-clamp-2 leading-relaxed'>
              {map.description}
            </p>
          )}
          {showProject && map.project && (
            <div className='px-3 py-1 text-xs rounded-lg bg-slate-100 text-slate-600 w-fit'>
              {map.project.name}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

export default function MapsPage() {
  return (
    <ProtectedRoute>
      <MapsContent />
    </ProtectedRoute>
  )
}
