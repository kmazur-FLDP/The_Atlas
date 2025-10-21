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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import {
  getMapsUsingSharedLayer,
  getSharedLayerById,
  getSharedLayerUsageCount,
  updateSharedLayer,
} from '@/lib/supabase/layers'
import type { SharedLayer } from '@/types'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

const LAYER_TYPES = [
  { value: 'zoning', label: 'Zoning' },
  { value: 'parcels', label: 'Parcels' },
  { value: 'boundaries', label: 'Boundaries' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'environmental', label: 'Environmental' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'custom', label: 'Custom' },
  { value: 'other', label: 'Other' },
]

export default function EditSharedLayer() {
  const router = useRouter()
  const { id } = router.query
  const { toast } = useToast()

  const [layer, setLayer] = useState<SharedLayer | null>(null)
  const [usageCount, setUsageCount] = useState<number>(0)
  const [mapsUsingLayer, setMapsUsingLayer] = useState<
    Array<{ map_id: string; name: string }>
  >([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    layer_type: 'other',
    tile_url: '',
    tile_layer_type: 'xyz' as 'xyz' | 'wms' | 'wmts' | 'vector',
  })

  useEffect(() => {
    const loadLayer = async (layerId: string) => {
      setLoading(true)
      try {
        const layerData = await getSharedLayerById(layerId)
        if (!layerData) throw new Error('Layer not found')

        setLayer(layerData)
        setFormData({
          name: layerData.name,
          description: layerData.description || '',
          layer_type: layerData.layer_type || 'other',
          tile_url: layerData.tile_url || '',
          tile_layer_type:
            (layerData.tile_layer_type as 'xyz' | 'wms' | 'wmts' | 'vector') ||
            'xyz',
        })

        // Load usage information
        const count = await getSharedLayerUsageCount(layerId)
        setUsageCount(count)

        const maps = await getMapsUsingSharedLayer(layerId)
        // Convert map_name to name for consistency
        setMapsUsingLayer(
          maps.map(m => ({ map_id: m.map_id, name: m.map_name }))
        )
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to load layer:', err)
        toast({
          title: 'Error',
          description: 'Failed to load layer details',
          variant: 'destructive',
        })
        router.push('/admin/layers')
      } finally {
        setLoading(false)
      }
    }

    if (id && typeof id === 'string') {
      loadLayer(id)
    }
  }, [id, router, toast])

  const handleSave = async () => {
    if (!id || typeof id !== 'string') return
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Layer name is required',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      const updateData: {
        name: string
        description?: string
        layer_type: string
        tile_url?: string
        tile_layer_type?: 'xyz' | 'wms' | 'wmts' | 'vector'
      } = {
        name: formData.name.trim(),
        layer_type: formData.layer_type,
      }

      if (formData.description.trim()) {
        updateData.description = formData.description.trim()
      }

      // Include tile URL and type for URL-based layers
      if (layer?.layer_source_type === 'url') {
        updateData.tile_url = formData.tile_url.trim()
        updateData.tile_layer_type = formData.tile_layer_type
      }

      const { error } = await updateSharedLayer(id, updateData)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Shared layer updated successfully',
      })

      router.push('/admin/layers')
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to update layer:', err)
      toast({
        title: 'Error',
        description: 'Failed to update layer',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className='flex items-center justify-center min-h-[400px]'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
        </div>
      </AdminLayout>
    )
  }

  if (!layer) {
    return (
      <AdminLayout>
        <div className='flex items-center justify-center min-h-[400px]'>
          <p className='text-gray-500'>Layer not found</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className='max-w-4xl mx-auto py-8 px-4'>
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>
              Edit Shared Layer
            </h1>
            <p className='text-gray-600 mt-1'>
              Update layer metadata and settings
            </p>
          </div>
          <Button
            variant='outline'
            onClick={() => router.push('/admin/layers')}
          >
            Cancel
          </Button>
        </div>

        <div className='grid gap-6'>
          {/* Layer Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Layer Information</CardTitle>
              <CardDescription>
                Edit the name, description, and type of this shared layer
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <Label htmlFor='name'>Layer Name *</Label>
                <Input
                  id='name'
                  value={formData.name}
                  onChange={e =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder='Enter layer name'
                  className='mt-1'
                />
              </div>

              <div>
                <Label htmlFor='layer_type'>Layer Type *</Label>
                <Select
                  value={formData.layer_type}
                  onValueChange={value =>
                    setFormData({ ...formData, layer_type: value })
                  }
                >
                  <SelectTrigger className='mt-1'>
                    <SelectValue placeholder='Select layer type' />
                  </SelectTrigger>
                  <SelectContent>
                    {LAYER_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor='description'>Description</Label>
                <textarea
                  id='description'
                  value={formData.description}
                  onChange={e =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder='Enter layer description (optional)'
                  rows={4}
                  className='mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>

              {/* Tile URL fields (only for URL-based layers) */}
              {layer?.layer_source_type === 'url' && (
                <>
                  <div>
                    <Label htmlFor='tile_url'>Tile URL *</Label>
                    <Input
                      id='tile_url'
                      value={formData.tile_url}
                      onChange={e =>
                        setFormData({ ...formData, tile_url: e.target.value })
                      }
                      placeholder='https://example.com/tiles/{z}/{x}/{y}.png'
                      className='mt-1'
                    />
                    <p className='mt-1 text-xs text-gray-500'>
                      URL template for the tile service
                    </p>
                  </div>

                  <div>
                    <Label htmlFor='tile_layer_type'>Tile Type *</Label>
                    <Select
                      value={formData.tile_layer_type}
                      onValueChange={value =>
                        setFormData({
                          ...formData,
                          tile_layer_type: value as
                            | 'xyz'
                            | 'wms'
                            | 'wmts'
                            | 'vector',
                        })
                      }
                    >
                      <SelectTrigger className='mt-1'>
                        <SelectValue placeholder='Select tile type' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='xyz'>XYZ Tiles</SelectItem>
                        <SelectItem value='wms'>WMS</SelectItem>
                        <SelectItem value='wmts'>WMTS</SelectItem>
                        <SelectItem value='vector'>Vector Tiles</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* File/URL Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>
                {layer?.layer_source_type === 'url'
                  ? 'Tile Service Details'
                  : 'File Details'}
              </CardTitle>
              <CardDescription>
                {layer?.layer_source_type === 'url'
                  ? 'Information about the tile service (read-only)'
                  : 'Information about the uploaded GeoJSON file (read-only)'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <div>
                  <dt className='text-sm font-medium text-gray-500'>
                    Source Type
                  </dt>
                  <dd className='mt-1 text-sm text-gray-900 capitalize'>
                    {layer?.layer_source_type === 'url'
                      ? 'External Tile URL'
                      : 'Uploaded File'}
                  </dd>
                </div>

                {layer?.layer_source_type === 'file' && layer.file_path && (
                  <div>
                    <dt className='text-sm font-medium text-gray-500'>
                      File Path
                    </dt>
                    <dd className='mt-1 text-sm text-gray-900 font-mono break-all'>
                      {layer.file_path}
                    </dd>
                  </div>
                )}

                {layer?.layer_source_type === 'url' && layer.tile_url && (
                  <div className='col-span-2'>
                    <dt className='text-sm font-medium text-gray-500'>
                      Current Tile URL
                    </dt>
                    <dd className='mt-1 text-sm text-gray-900 font-mono break-all'>
                      {layer.tile_url}
                    </dd>
                  </div>
                )}

                {layer?.layer_source_type === 'file' && (
                  <>
                    <div>
                      <dt className='text-sm font-medium text-gray-500'>
                        File Size
                      </dt>
                      <dd className='mt-1 text-sm text-gray-900'>
                        {layer.file_size
                          ? formatFileSize(layer.file_size)
                          : 'Unknown'}
                      </dd>
                    </div>
                    <div>
                      <dt className='text-sm font-medium text-gray-500'>
                        Feature Count
                      </dt>
                      <dd className='mt-1 text-sm text-gray-900'>
                        {layer.feature_count
                          ? layer.feature_count.toLocaleString()
                          : '0'}{' '}
                        features
                      </dd>
                    </div>
                  </>
                )}

                {layer?.layer_source_type === 'url' &&
                  layer.tile_layer_type && (
                    <div>
                      <dt className='text-sm font-medium text-gray-500'>
                        Tile Format
                      </dt>
                      <dd className='mt-1 text-sm text-gray-900 uppercase'>
                        {layer.tile_layer_type}
                      </dd>
                    </div>
                  )}

                <div>
                  <dt className='text-sm font-medium text-gray-500'>Created</dt>
                  <dd className='mt-1 text-sm text-gray-900'>
                    {formatDate(layer.created_at)}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Usage Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Usage Information</CardTitle>
              <CardDescription>
                Maps currently using this shared layer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='mb-4'>
                <p className='text-2xl font-bold text-gray-900'>{usageCount}</p>
                <p className='text-sm text-gray-500'>
                  {usageCount === 1 ? 'map is' : 'maps are'} using this layer
                </p>
              </div>

              {mapsUsingLayer.length > 0 && (
                <div className='mt-4'>
                  <p className='text-sm font-medium text-gray-700 mb-2'>
                    Maps:
                  </p>
                  <ul className='space-y-2'>
                    {mapsUsingLayer.map(map => (
                      <li
                        key={map.map_id}
                        className='flex items-center justify-between px-3 py-2 bg-gray-50 rounded-md'
                      >
                        <span className='text-sm text-gray-900'>
                          {map.name}
                        </span>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() =>
                            router.push(`/admin/maps/${map.map_id}/edit`)
                          }
                        >
                          View
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {usageCount === 0 && (
                <div className='mt-4 p-4 bg-blue-50 rounded-md'>
                  <p className='text-sm text-blue-700'>
                    This layer is not currently used by any maps. You can safely
                    delete it or assign it to maps.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className='flex justify-end gap-4'>
            <Button
              variant='outline'
              onClick={() => router.push('/admin/layers')}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
