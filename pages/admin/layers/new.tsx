import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { createSharedLayer } from '@/lib/supabase/layers'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState } from 'react'

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

const TILE_LAYER_TYPES = [
  { value: 'xyz', label: 'XYZ Tiles (e.g., OpenStreetMap)' },
  { value: 'wms', label: 'WMS (Web Map Service)' },
  { value: 'wmts', label: 'WMTS (Web Map Tile Service)' },
  { value: 'vector', label: 'Vector Tiles' },
]

function NewSharedLayerContent() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [sourceType, setSourceType] = useState<'file' | 'url'>('file')

  // File upload state
  const [file, setFile] = useState<File | null>(null)
  const [featureCount, setFeatureCount] = useState<number | null>(null)

  // URL state
  const [tileUrl, setTileUrl] = useState('')
  const [tileLayerType, setTileLayerType] = useState<
    'xyz' | 'wms' | 'wmts' | 'vector'
  >('xyz')

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    layer_type: 'other',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = 'Layer name is required'

    if (sourceType === 'file') {
      if (!file) newErrors.file = 'GeoJSON file is required'
    } else {
      if (!tileUrl.trim()) newErrors.tileUrl = 'Tile URL is required'
      // Basic URL validation
      try {
        new URL(tileUrl)
      } catch {
        newErrors.tileUrl = 'Please enter a valid URL'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const selectedFile = files[0]
    if (!selectedFile) return

    if (!selectedFile.name.endsWith('.geojson')) {
      toast({
        title: 'Invalid File',
        description: 'Only .geojson files are supported',
        variant: 'destructive',
      })
      return
    }

    setFile(selectedFile)

    // Auto-generate name from filename if empty
    if (!formData.name) {
      const generatedName = selectedFile.name
        .replace('.geojson', '')
        .replace(/[-_]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      setFormData(prev => ({ ...prev, name: generatedName }))
    }

    // Try to count features
    try {
      const text = await selectedFile.text()
      const geojson = JSON.parse(text)
      if (geojson.features && Array.isArray(geojson.features)) {
        setFeatureCount(geojson.features.length)
      }
    } catch (error) {
      // Ignore parsing errors for feature count
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)

    try {
      if (sourceType === 'file') {
        if (!file) return
        setUploadingFile(true)

        // Generate unique filename
        const timestamp = Date.now()
        const sanitizedName = formData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
        const filename = `${sanitizedName}-${timestamp}.geojson`
        const filePath = `shared-layers/${filename}`

        // Upload file to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('project-files')
          .upload(filePath, file)

        setUploadingFile(false)

        if (uploadError) {
          toast({
            title: 'Upload Error',
            description: uploadError.message,
            variant: 'destructive',
          })
          setLoading(false)
          return
        }

        // Create database record for file-based layer
        const { error: dbError } = await createSharedLayer({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          layer_source_type: 'file',
          file_path: filePath,
          layer_type: formData.layer_type,
          file_size: file.size,
          feature_count: featureCount || undefined,
        })

        if (dbError) {
          // Clean up uploaded file if database insert fails
          await supabase.storage.from('project-files').remove([filePath])

          toast({
            title: 'Error',
            description: dbError,
            variant: 'destructive',
          })
          setLoading(false)
          return
        }

        toast({
          title: 'Success',
          description: `"${formData.name}" has been uploaded and is now available as a shared layer.`,
        })
      } else {
        // Create database record for URL-based tile layer
        const { error: dbError } = await createSharedLayer({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          layer_source_type: 'url',
          tile_url: tileUrl.trim(),
          tile_layer_type: tileLayerType,
          layer_type: formData.layer_type,
        })

        if (dbError) {
          toast({
            title: 'Error',
            description: dbError,
            variant: 'destructive',
          })
          setLoading(false)
          return
        }

        toast({
          title: 'Success',
          description: `"${formData.name}" tile layer has been added as a shared layer.`,
        })
      }

      router.push('/admin/layers')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
      setLoading(false)
      setUploadingFile(false)
    }
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <AdminLayout>
      <Head>
        <title>Upload Shared Layer - Admin</title>
      </Head>

      <div className='max-w-2xl mx-auto'>
        <div className='mb-6'>
          <h1 className='text-3xl font-bold text-slate-900'>
            Upload Shared Layer
          </h1>
          <p className='mt-1 text-slate-600'>
            Add a reusable data layer available to all maps
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Layer Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-6'>
              {/* Source Type Tabs */}
              <Tabs
                defaultValue='file'
                onValueChange={v => setSourceType(v as 'file' | 'url')}
              >
                <TabsList className='grid w-full grid-cols-2'>
                  <TabsTrigger value='file'>Upload File</TabsTrigger>
                  <TabsTrigger value='url'>Tile URL</TabsTrigger>
                </TabsList>

                {/* File Upload Tab */}
                <TabsContent value='file' className='space-y-6'>
                  <div>
                    <Label htmlFor='file-upload'>
                      GeoJSON File <span className='text-red-500'>*</span>
                    </Label>
                    <div className='mt-2'>
                      {!file ? (
                        <label
                          htmlFor='file-upload'
                          className='flex items-center justify-center w-full px-6 py-8 transition-colors border-2 border-dashed rounded-xl cursor-pointer border-slate-300 hover:border-brand-primary bg-slate-50 hover:bg-blue-50'
                        >
                          <div className='text-center'>
                            <svg
                              className='w-12 h-12 mx-auto mb-3 text-slate-400'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
                              />
                            </svg>
                            <p className='mb-1 text-sm font-medium text-slate-700'>
                              Click to upload or drag and drop
                            </p>
                            <p className='text-xs text-slate-500'>
                              GeoJSON files only
                            </p>
                          </div>
                          <input
                            id='file-upload'
                            type='file'
                            accept='.geojson'
                            onChange={handleFileChange}
                            className='sr-only'
                          />
                        </label>
                      ) : (
                        <div className='p-4 border rounded-xl border-slate-200 bg-slate-50'>
                          <div className='flex items-start justify-between'>
                            <div className='flex-1'>
                              <div className='flex items-center'>
                                <svg
                                  className='w-8 h-8 mr-3 text-green-600'
                                  fill='none'
                                  stroke='currentColor'
                                  viewBox='0 0 24 24'
                                >
                                  <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                                  />
                                </svg>
                                <div>
                                  <p className='font-medium text-slate-900'>
                                    {file.name}
                                  </p>
                                  <div className='flex gap-3 mt-1 text-xs text-slate-500'>
                                    <span>{formatFileSize(file.size)}</span>
                                    {featureCount !== null && (
                                      <span>
                                        {featureCount.toLocaleString()} features
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <button
                              type='button'
                              onClick={() => {
                                setFile(null)
                                setFeatureCount(null)
                              }}
                              className='ml-4 text-red-600 hover:text-red-700'
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
                                  d='M6 18L18 6M6 6l12 12'
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                      {errors.file && (
                        <p className='mt-1 text-sm text-red-600'>
                          {errors.file}
                        </p>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* Tile URL Tab */}
                <TabsContent value='url' className='space-y-6'>
                  <div>
                    <Label htmlFor='tile_url'>
                      Tile URL <span className='text-red-500'>*</span>
                    </Label>
                    <Input
                      id='tile_url'
                      value={tileUrl}
                      onChange={e => setTileUrl(e.target.value)}
                      placeholder='https://example.com/tiles/{z}/{x}/{y}.png'
                      className={errors.tileUrl ? 'border-red-500' : ''}
                    />
                    {errors.tileUrl && (
                      <p className='mt-1 text-sm text-red-600'>
                        {errors.tileUrl}
                      </p>
                    )}
                    <p className='mt-1 text-xs text-slate-500'>
                      Enter the URL template for your tile service. Use
                      placeholders like {'{z}'}, {'{x}'}, {'{y}'} for XYZ tiles.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor='tile_layer_type'>Tile Type</Label>
                    <Select
                      value={tileLayerType}
                      onValueChange={value =>
                        setTileLayerType(
                          value as 'xyz' | 'wms' | 'wmts' | 'vector'
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TILE_LAYER_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className='mt-1 text-xs text-slate-500'>
                      Select the type of tile service you&apos;re using
                    </p>
                  </div>

                  <div className='p-4 rounded-lg bg-amber-50'>
                    <div className='flex'>
                      <svg
                        className='w-5 h-5 mr-3 text-amber-600 shrink-0'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                        />
                      </svg>
                      <div className='text-sm text-amber-900'>
                        <p className='font-medium'>Example URLs</p>
                        <ul className='mt-2 space-y-1 text-amber-800 list-disc list-inside'>
                          <li>
                            XYZ: https://tile.openstreetmap.org/{'{z}/{x}/{y}'}
                            .png
                          </li>
                          <li>
                            WMS:
                            https://example.com/wms?layers=layer1&styles=default
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Name */}
              <div>
                <Label htmlFor='name'>
                  Layer Name <span className='text-red-500'>*</span>
                </Label>
                <Input
                  id='name'
                  value={formData.name}
                  onChange={e =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder='e.g., Orlando Zoning Districts'
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className='mt-1 text-sm text-red-600'>{errors.name}</p>
                )}
              </div>

              {/* Layer Type */}
              <div>
                <Label htmlFor='layer_type'>Layer Type</Label>
                <Select
                  value={formData.layer_type}
                  onValueChange={value =>
                    setFormData({ ...formData, layer_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LAYER_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className='mt-1 text-xs text-slate-500'>
                  Helps organize layers by category
                </p>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor='description'>Description</Label>
                <textarea
                  id='description'
                  value={formData.description}
                  onChange={e =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder='Brief description of what this layer contains...'
                  rows={3}
                  className='w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>

              {/* Info Panel */}
              <div className='p-4 rounded-lg bg-blue-50'>
                <div className='flex'>
                  <svg
                    className='w-5 h-5 mr-3 text-blue-600 shrink-0'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                  <div className='text-sm text-blue-900'>
                    <p className='font-medium'>Shared Layer Usage</p>
                    <p className='mt-1 text-blue-800'>
                      Once uploaded, this layer will be available to select when
                      creating or editing any map. Admins can assign this layer
                      to multiple maps, and updates to the layer will reflect
                      across all maps using it.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className='flex justify-end pt-4 space-x-3 border-t border-slate-200'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => router.push('/admin/layers')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type='submit' disabled={loading}>
                  {loading ? (
                    <>
                      <div className='w-4 h-4 mr-2 border-b-2 border-white rounded-full animate-spin'></div>
                      {uploadingFile
                        ? 'Uploading file...'
                        : 'Creating layer...'}
                    </>
                  ) : (
                    'Upload Layer'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

export default function NewSharedLayerPage() {
  return (
    <ProtectedRoute requireAdmin>
      <NewSharedLayerContent />
    </ProtectedRoute>
  )
}
