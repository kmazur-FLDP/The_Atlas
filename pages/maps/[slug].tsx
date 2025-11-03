import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { MainLayout } from '@/components/layout/MainLayout'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'
import { getMapLayers } from '@/lib/supabase/layers'
import type { MapLayerDetailed, Map as MapType } from '@/types'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'

// Import custom map components dynamically (SSR disabled for Leaflet)
// Add new custom maps here as you create them
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CUSTOM_MAP_COMPONENTS: Record<string, any> = {
  'downtown-analysis': dynamic(
    () => import('@/components/maps/custom/DowntownAnalysis'),
    { ssr: false }
  ),
}

interface MapData extends MapType {
  project?: {
    id: string
    name: string
    created_at: string
  }
}

function MapViewerContent() {
  const router = useRouter()
  const { slug } = router.query
  const { user, profile } = useAuth()
  const [mapData, setMapData] = useState<MapData | null>(null)
  const [mapLayers, setMapLayers] = useState<MapLayerDetailed[]>([])
  const [hasAccess, setHasAccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadMapLayers = async (mapId: string) => {
    try {
      const layers = await getMapLayers(mapId)
      setMapLayers(layers)
    } catch (err) {
      // Error loading layers - map will work without layers
      // eslint-disable-next-line no-console
      console.error('Failed to load map layers:', err)
    }
  }

  const checkAccessAndLoadMap = useCallback(
    async (mapSlug: string) => {
      if (!user || !profile) return

      setLoading(true)
      setError(null)

      try {
        // Get map details with project info
        const { data: map, error: mapError } = await supabase
          .from('maps')
          .select(
            `
            *,
            project:projects(id, name)
          `
          )
          .eq('url_slug', mapSlug)
          .eq('is_active', true)
          .single()

        if (mapError || !map) {
          setError('Map not found or is not active')
          setLoading(false)
          return
        }

        // Check if user's company has access to this project
        // Admins have access to everything
        if (profile.is_admin) {
          setMapData(map)
          setHasAccess(true)
          setLoading(false)
          loadMapLayers(map.id)
          return
        }

        const { data: access, error: accessError } = await supabase
          .from('project_access')
          .select('id')
          .eq('project_id', map.project_id)
          .eq('company_id', profile.company_id)
          .single()

        if (accessError || !access) {
          setError('You do not have access to this map')
          setLoading(false)
          return
        }

        setMapData(map)
        setHasAccess(true)
        loadMapLayers(map.id)
      } catch (err) {
        setError('An error occurred while loading the map')
        // Log error for debugging
        if (err) {
          // Error logged
        }
      } finally {
        setLoading(false)
      }
    },
    [user, profile]
  )

  useEffect(() => {
    if (slug && typeof slug === 'string') {
      checkAccessAndLoadMap(slug)
    }
  }, [slug, checkAccessAndLoadMap])

  if (loading) {
    return (
      <MainLayout>
        <div className='flex items-center justify-center h-screen'>
          <div className='text-center'>
            <div className='w-12 h-12 mx-auto mb-4 border-4 border-t-4 rounded-full animate-spin border-brand-primary border-t-transparent'></div>
            <p className='text-slate-600'>Loading map...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (error || !hasAccess || !mapData) {
    return (
      <MainLayout>
        <div className='flex items-center justify-center h-screen'>
          <div className='max-w-md text-center'>
            <div className='p-4 mb-4 rounded-full bg-slate-100 w-16 h-16 mx-auto flex items-center justify-center'>
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
                  d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                />
              </svg>
            </div>
            <h2 className='mb-2 text-xl font-bold text-slate-900'>
              {error || 'Access Denied'}
            </h2>
            <p className='mb-6 text-slate-600'>
              {error ||
                'You do not have permission to view this map. Please contact your administrator.'}
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className='px-6 py-2 text-white transition-all duration-200 rounded-xl bg-brand-primary hover:scale-[1.02] shadow-sm hover:shadow-md'
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </MainLayout>
    )
  }

  // Check if this slug has a custom component
  const CustomComponent = CUSTOM_MAP_COMPONENTS[slug as string]

  if (CustomComponent) {
    // Render custom component (no layout wrapper needed, component handles everything)
    return (
      <>
        <Head>
          <title>{mapData.name} - The Atlas</title>
          <meta name='description' content={mapData.description || ''} />
        </Head>
        <CustomComponent mapData={mapData} mapLayers={mapLayers} />
      </>
    )
  }

  // Fallback: render as iframe if no custom component exists
  // Build iframe URL - could be external URL or internal map URL
  const iframeUrl = mapData.url_slug.startsWith('http')
    ? mapData.url_slug
    : `/maps/viewer/${mapData.url_slug}`

  return (
    <>
      <Head>
        <title>{mapData.name} - The Atlas</title>
        <meta name='description' content={mapData.description || ''} />
      </Head>
      <div className='relative w-full h-screen'>
        {/* Header bar with map info */}
        <div className='absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 shadow-md bg-brand-primary'>
          <div className='flex items-center gap-4'>
            <button
              onClick={() => router.push('/maps')}
              className='p-2 text-white transition-colors rounded-xl hover:bg-white/10'
            >
              <svg
                className='w-5 h-5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M10 19l-7-7m0 0l7-7m-7 7h18'
                />
              </svg>
            </button>
            <div>
              <h1 className='text-lg font-bold text-white'>{mapData.name}</h1>
              {mapData.description && (
                <p className='text-sm text-white/80'>{mapData.description}</p>
              )}
            </div>
          </div>
          {mapData.project && (
            <div className='px-4 py-2 text-sm text-white border border-white/30 rounded-xl bg-white/10'>
              Project: {mapData.project.name}
            </div>
          )}
        </div>

        {/* Map iframe */}
        <iframe
          src={iframeUrl}
          className='w-full h-full border-0'
          title={mapData.name}
          allow='geolocation'
        />
      </div>
    </>
  )
}

export default function MapViewerPage() {
  return (
    <ProtectedRoute>
      <MapViewerContent />
    </ProtectedRoute>
  )
}
