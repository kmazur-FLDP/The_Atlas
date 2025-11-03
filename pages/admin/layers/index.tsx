import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import {
  deleteSharedLayer,
  getAllSharedLayers,
  getSharedLayerUsageCount,
} from '@/lib/supabase/layers'
import type { SharedLayer } from '@/types'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

function SharedLayersContent() {
  const router = useRouter()
  const { toast } = useToast()
  const [layers, setLayers] = useState<SharedLayer[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [usageCounts, setUsageCounts] = useState<Record<string, number>>({})

  async function loadLayers() {
    setLoading(true)
    const data = await getAllSharedLayers()
    setLayers(data)

    // Load usage counts for each layer
    const counts: Record<string, number> = {}
    for (const layer of data) {
      counts[layer.id] = await getSharedLayerUsageCount(layer.id)
    }
    setUsageCounts(counts)

    setLoading(false)
  }

  // Load data on mount and whenever we navigate to this page
  useEffect(() => {
    if (router.isReady) {
      loadLayers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.asPath])

  async function handleDelete(id: string, name: string) {
    const usageCount = usageCounts[id] || 0
    if (usageCount > 0) {
      const confirmed = window.confirm(
        `"${name}" is used by ${usageCount} map(s). Deleting it will remove it from all maps. Continue?`
      )
      if (!confirmed) return
    } else {
      const confirmed = window.confirm(
        `Are you sure you want to delete "${name}"?`
      )
      if (!confirmed) return
    }

    setDeleting(id)
    const { error } = await deleteSharedLayer(id)

    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Success',
        description: `"${name}" has been deleted.`,
      })
      loadLayers()
    }

    setDeleting(null)
  }

  function formatFileSize(bytes?: number): string {
    if (!bytes) return 'Unknown'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const layersByType = layers.reduce(
    (acc, layer) => {
      const type = layer.layer_type || 'other'
      if (!acc[type]) acc[type] = []
      acc[type].push(layer)
      return acc
    },
    {} as Record<string, SharedLayer[]>
  )

  const typeOrder = [
    'zoning',
    'parcels',
    'boundaries',
    'transportation',
    'utilities',
    'environmental',
    'infrastructure',
    'custom',
    'other',
  ]
  const sortedTypes = Object.keys(layersByType).sort(
    (a, b) => typeOrder.indexOf(a) - typeOrder.indexOf(b)
  )

  return (
    <AdminLayout>
      <Head>
        <title>Shared Layers - Admin</title>
      </Head>

      <div className='mx-auto max-w-7xl'>
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h1 className='text-3xl font-bold text-slate-900'>Shared Layers</h1>
            <p className='mt-1 text-slate-600'>
              Manage reusable data layers available across all maps
            </p>
          </div>
          <Link href='/admin/layers/new'>
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
              Upload Layer
            </Button>
          </Link>
        </div>

        {loading && (
          <Card>
            <CardContent className='p-12 text-center'>
              <div className='w-8 h-8 mx-auto mb-4 border-b-2 rounded-full animate-spin border-brand-primary'></div>
              <p className='text-slate-600'>Loading layers...</p>
            </CardContent>
          </Card>
        )}

        {!loading && layers.length === 0 && (
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
                    d='M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z'
                  />
                </svg>
              </div>
              <h3 className='mb-2 text-lg font-bold text-slate-700'>
                No shared layers yet
              </h3>
              <p className='mb-4 text-slate-500'>
                Upload GeoJSON layers that can be reused across multiple maps
              </p>
              <Link href='/admin/layers/new'>
                <Button>Upload First Layer</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {!loading && layers.length > 0 && (
          <div className='space-y-6'>
            <div className='grid gap-4 md:grid-cols-3'>
              <Card>
                <CardContent className='p-4'>
                  <div className='text-2xl font-bold text-brand-primary'>
                    {layers.length}
                  </div>
                  <div className='text-sm text-slate-600'>Total Layers</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className='p-4'>
                  <div className='text-2xl font-bold text-brand-primary'>
                    {Object.keys(layersByType).length}
                  </div>
                  <div className='text-sm text-slate-600'>Layer Types</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className='p-4'>
                  <div className='text-2xl font-bold text-brand-primary'>
                    {formatFileSize(
                      layers.reduce((sum, l) => sum + (l.file_size || 0), 0)
                    )}
                  </div>
                  <div className='text-sm text-slate-600'>Total Storage</div>
                </CardContent>
              </Card>
            </div>

            {sortedTypes.map(type => {
              const typeLayers = layersByType[type]
              if (!typeLayers) return null

              return (
                <div key={type}>
                  <h2 className='mb-3 text-xl font-bold text-slate-800 capitalize'>
                    {type === 'other' ? 'Other' : type}
                    <span className='ml-2 text-sm font-normal text-slate-500'>
                      ({typeLayers.length})
                    </span>
                  </h2>
                  <div className='space-y-3'>
                    {typeLayers.map(layer => (
                      <Card
                        key={layer.id}
                        className='transition-shadow hover:shadow-md'
                      >
                        <CardContent className='p-4'>
                          <div className='flex items-start justify-between'>
                            <div className='flex-1'>
                              <h3 className='text-lg font-bold text-slate-900'>
                                {layer.name}
                              </h3>
                              {layer.description && (
                                <p className='mt-1 text-sm text-slate-600'>
                                  {layer.description}
                                </p>
                              )}
                              <div className='flex flex-wrap gap-4 mt-3 text-xs text-slate-500'>
                                <div className='flex items-center'>
                                  <svg
                                    className='w-4 h-4 mr-1'
                                    fill='none'
                                    stroke='currentColor'
                                    viewBox='0 0 24 24'
                                  >
                                    <path
                                      strokeLinecap='round'
                                      strokeLinejoin='round'
                                      strokeWidth={2}
                                      d='M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z'
                                    />
                                  </svg>
                                  {layer.layer_source_type === 'url'
                                    ? 'Tile URL'
                                    : formatFileSize(layer.file_size)}
                                </div>
                                {layer.feature_count &&
                                  layer.layer_source_type === 'file' && (
                                    <div className='flex items-center'>
                                      <svg
                                        className='w-4 h-4 mr-1'
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
                                      {layer.feature_count.toLocaleString()}{' '}
                                      features
                                    </div>
                                  )}
                                {layer.layer_source_type === 'url' &&
                                  layer.tile_layer_type && (
                                    <div className='flex items-center'>
                                      <svg
                                        className='w-4 h-4 mr-1'
                                        fill='none'
                                        stroke='currentColor'
                                        viewBox='0 0 24 24'
                                      >
                                        <path
                                          strokeLinecap='round'
                                          strokeLinejoin='round'
                                          strokeWidth={2}
                                          d='M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1'
                                        />
                                      </svg>
                                      {layer.tile_layer_type.toUpperCase()}
                                    </div>
                                  )}
                                <div className='flex items-center'>
                                  <svg
                                    className='w-4 h-4 mr-1'
                                    fill='none'
                                    stroke='currentColor'
                                    viewBox='0 0 24 24'
                                  >
                                    <path
                                      strokeLinecap='round'
                                      strokeLinejoin='round'
                                      strokeWidth={2}
                                      d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                                    />
                                  </svg>
                                  {formatDate(layer.created_at)}
                                </div>
                                <div className='flex items-center'>
                                  <svg
                                    className='w-4 h-4 mr-1'
                                    fill='none'
                                    stroke='currentColor'
                                    viewBox='0 0 24 24'
                                  >
                                    <path
                                      strokeLinecap='round'
                                      strokeLinejoin='round'
                                      strokeWidth={2}
                                      d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                                    />
                                  </svg>
                                  Used by {usageCounts[layer.id] || 0} map(s)
                                </div>
                              </div>
                            </div>
                            <div className='flex gap-2 ml-4'>
                              <Link href={`/admin/layers/${layer.id}/edit`}>
                                <Button variant='outline' size='sm'>
                                  Edit
                                </Button>
                              </Link>
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() =>
                                  handleDelete(layer.id, layer.name)
                                }
                                disabled={deleting === layer.id}
                                className='text-red-600 hover:text-red-700 hover:border-red-300'
                              >
                                {deleting === layer.id ? (
                                  <>
                                    <div className='w-3 h-3 mr-1 border-b-2 border-red-600 rounded-full animate-spin'></div>
                                    Deleting
                                  </>
                                ) : (
                                  'Delete'
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default function SharedLayersPage() {
  return (
    <ProtectedRoute requireAdmin>
      <SharedLayersContent />
    </ProtectedRoute>
  )
}
