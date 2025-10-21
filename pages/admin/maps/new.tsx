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
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { createMap } from '@/lib/supabase/maps'
import { getAllProjects } from '@/lib/supabase/projects'
import type { Project } from '@/types'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

interface DataLayer {
  id: string
  file: File
  label: string
  fileName: string
  size: number
}

type MapType = 'iframe' | 'custom'

function NewMapContentEnhanced() {
  const router = useRouter()
  const { toast } = useToast()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [mapType, setMapType] = useState<MapType>('iframe')
  const [dataLayers, setDataLayers] = useState<DataLayer[]>([])

  const [formData, setFormData] = useState({
    project_id: '',
    name: '',
    url_slug: '',
    description: '',
    sort_order: '0',
    iframe_url: '',
    component_name: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const loadProjects = async () => {
      const data = await getAllProjects()
      setProjects(data)
      if (data.length > 0) {
        const firstProject = data[0]
        if (firstProject) {
          setFormData(prev => ({ ...prev, project_id: firstProject.id }))
        }
      }
    }
    loadProjects()
  }, [])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.project_id) newErrors.project_id = 'Project is required'
    if (!formData.name.trim()) newErrors.name = 'Map name is required'
    if (!formData.url_slug.trim()) newErrors.url_slug = 'URL slug is required'
    if (!/^[a-z0-9-]+$/.test(formData.url_slug)) {
      newErrors.url_slug =
        'URL slug must contain only lowercase letters, numbers, and hyphens'
    }

    if (mapType === 'iframe' && !formData.iframe_url.trim()) {
      newErrors.iframe_url = 'Iframe URL is required for iframe maps'
    }

    if (mapType === 'custom' && !formData.component_name.trim()) {
      newErrors.component_name = 'Component name is required for custom maps'
    } else if (
      mapType === 'custom' &&
      !/^[a-zA-Z][a-zA-Z0-9]*$/.test(formData.component_name)
    ) {
      newErrors.component_name =
        'Component name must start with a letter and contain only letters and numbers'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    if (!file) return

    if (!file.name.endsWith('.geojson')) {
      toast({
        title: 'Invalid File',
        description: 'Only .geojson files are supported',
        variant: 'destructive',
      })
      return
    }

    const newLayer: DataLayer = {
      id: Math.random().toString(36).substr(2, 9),
      file,
      label: file.name.replace('.geojson', '').replace(/[-_]/g, ' '),
      fileName: file.name,
      size: file.size,
    }

    setDataLayers(prev => [...prev, newLayer])
    e.target.value = ''
  }

  const removeDataLayer = (id: string) => {
    setDataLayers(prev => prev.filter(layer => layer.id !== id))
  }

  const updateLayerLabel = (id: string, label: string) => {
    setDataLayers(prev =>
      prev.map(layer => (layer.id === id ? { ...layer, label } : layer))
    )
  }

  const generateProjectSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const uploadDataLayers = async (projectName: string): Promise<boolean> => {
    if (dataLayers.length === 0) return true

    const projectSlug = generateProjectSlug(projectName)

    try {
      for (const layer of dataLayers) {
        const filePath = `map-data/${projectSlug}/${layer.fileName}`

        const { error } = await supabase.storage
          .from('project-files')
          .upload(filePath, layer.file, {
            cacheControl: '3600',
            upsert: true,
          })

        if (error) {
          toast({
            title: 'Upload Error',
            description: `Failed to upload ${layer.fileName}: ${error.message}`,
            variant: 'destructive',
          })
          return false
        }
      }
      return true
    } catch (error) {
      toast({
        title: 'Upload Error',
        description: 'An unexpected error occurred while uploading files',
        variant: 'destructive',
      })
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)

    try {
      const project = projects.find(p => p.id === formData.project_id)
      if (!project) {
        toast({
          title: 'Error',
          description: 'Selected project not found',
          variant: 'destructive',
        })
        setLoading(false)
        return
      }

      // Upload data layers if custom map
      if (mapType === 'custom' && dataLayers.length > 0) {
        const uploadSuccess = await uploadDataLayers(project.name)
        if (!uploadSuccess) {
          setLoading(false)
          return
        }
      }

      // Create map record
      const { error } = await createMap({
        project_id: formData.project_id,
        name: formData.name.trim(),
        url_slug: formData.url_slug.trim(),
        description: formData.description.trim() || undefined,
        sort_order: parseInt(formData.sort_order) || 0,
        is_active: true,
      })

      if (error) {
        toast({ title: 'Error', description: error, variant: 'destructive' })
        setLoading(false)
        return
      }

      const successMessage =
        mapType === 'custom'
          ? `Map created! ${dataLayers.length > 0 ? `${dataLayers.length} layer(s) uploaded. ` : ''}Register "${formData.component_name}" in [slug].tsx`
          : `Map "${formData.name}" has been created.`

      toast({
        title: 'Success',
        description: successMessage,
      })

      router.push('/admin/maps')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
      setLoading(false)
    }
  }

  const generateSlug = () => {
    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    setFormData({ ...formData, url_slug: slug })
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <AdminLayout>
      <Head>
        <title>Add Map - Admin</title>
      </Head>

      <div className='max-w-4xl'>
        <div className='mb-6'>
          <h1 className='text-3xl font-bold text-slate-900'>Add Map</h1>
          <p className='mt-1 text-slate-600'>
            {mapType === 'custom'
              ? 'Create a custom interactive map with data layers'
              : 'Create a map with an embedded iframe'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Map Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-6'>
              {/* Map Type Selection */}
              <div>
                <Label>
                  Map Type <span className='text-red-500'>*</span>
                </Label>
                <div className='grid grid-cols-2 gap-4 mt-2'>
                  <button
                    type='button'
                    onClick={() => setMapType('iframe')}
                    className={`p-4 border-2 rounded-xl transition-all ${
                      mapType === 'iframe'
                        ? 'border-brand-primary bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className='flex flex-col items-center space-y-2'>
                      <svg
                        className='w-8 h-8 text-slate-600'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                        />
                      </svg>
                      <span className='font-semibold text-slate-900'>
                        Iframe Embed
                      </span>
                      <p className='text-xs text-center text-slate-600'>
                        Embed an external map URL
                      </p>
                    </div>
                  </button>
                  <button
                    type='button'
                    onClick={() => setMapType('custom')}
                    className={`p-4 border-2 rounded-xl transition-all ${
                      mapType === 'custom'
                        ? 'border-brand-primary bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className='flex flex-col items-center space-y-2'>
                      <svg
                        className='w-8 h-8 text-slate-600'
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
                      <span className='font-semibold text-slate-900'>
                        Custom Component
                      </span>
                      <p className='text-xs text-center text-slate-600'>
                        Interactive map with data layers
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor='project_id'>
                  Project <span className='text-red-500'>*</span>
                </Label>
                <Select
                  value={formData.project_id}
                  onValueChange={value =>
                    setFormData({ ...formData, project_id: value })
                  }
                >
                  <SelectTrigger
                    className={errors.project_id ? 'border-red-500' : ''}
                  >
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
                {errors.project_id && (
                  <p className='mt-1 text-sm text-red-600'>
                    {errors.project_id}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor='name'>
                  Map Name <span className='text-red-500'>*</span>
                </Label>
                <Input
                  id='name'
                  value={formData.name}
                  onChange={e =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder='e.g., Downtown Zoning Analysis'
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className='mt-1 text-sm text-red-600'>{errors.name}</p>
                )}
              </div>

              <div>
                <Label htmlFor='url_slug'>
                  URL Slug <span className='text-red-500'>*</span>
                  <Button
                    type='button'
                    variant='link'
                    size='sm'
                    onClick={generateSlug}
                    className='h-auto p-0 ml-2'
                  >
                    Generate from name
                  </Button>
                </Label>
                <Input
                  id='url_slug'
                  value={formData.url_slug}
                  onChange={e =>
                    setFormData({ ...formData, url_slug: e.target.value })
                  }
                  placeholder='e.g., downtown-zoning'
                  className={errors.url_slug ? 'border-red-500' : ''}
                />
                <p className='mt-1 text-xs text-slate-500'>
                  Will be accessible at /maps/{formData.url_slug || 'your-slug'}
                </p>
                {errors.url_slug && (
                  <p className='mt-1 text-sm text-red-600'>{errors.url_slug}</p>
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
                  placeholder='Brief description of the map...'
                  rows={3}
                  className='w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>

              {/* Iframe URL - only for iframe maps */}
              {mapType === 'iframe' && (
                <div>
                  <Label htmlFor='iframe_url'>
                    Iframe URL <span className='text-red-500'>*</span>
                  </Label>
                  <Input
                    id='iframe_url'
                    value={formData.iframe_url}
                    onChange={e =>
                      setFormData({ ...formData, iframe_url: e.target.value })
                    }
                    placeholder='https://example.com/map'
                    className={errors.iframe_url ? 'border-red-500' : ''}
                  />
                  {errors.iframe_url && (
                    <p className='mt-1 text-sm text-red-600'>
                      {errors.iframe_url}
                    </p>
                  )}
                </div>
              )}

              {/* Custom Component Section */}
              {mapType === 'custom' && (
                <>
                  {/* Data Layer Upload */}
                  <div className='p-4 space-y-4 border-2 border-dashed rounded-xl border-slate-300 bg-slate-50'>
                    <div className='flex items-start'>
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
                      <div>
                        <p className='text-sm font-medium text-slate-900'>
                          Data Layers (Optional)
                        </p>
                        <p className='text-xs text-slate-600'>
                          Upload GeoJSON files. Saved to: map-data/
                          {generateProjectSlug(
                            projects.find(p => p.id === formData.project_id)
                              ?.name || 'project'
                          )}
                          /
                        </p>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor='file-upload'
                        className='flex items-center justify-center w-full px-6 py-4 transition-colors border-2 border-dashed rounded-lg cursor-pointer border-slate-300 hover:border-brand-primary hover:bg-blue-50'
                      >
                        <div className='text-center'>
                          <svg
                            className='w-10 h-10 mx-auto mb-2 text-slate-400'
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
                          <p className='text-sm font-medium text-slate-700'>
                            Click to upload GeoJSON files
                          </p>
                          <p className='text-xs text-slate-500'>
                            .geojson only
                          </p>
                        </div>
                        <input
                          id='file-upload'
                          type='file'
                          accept='.geojson'
                          onChange={handleFileUpload}
                          className='sr-only'
                        />
                      </label>
                    </div>

                    {dataLayers.length > 0 && (
                      <div className='space-y-2'>
                        <Label className='text-xs'>
                          Uploaded ({dataLayers.length})
                        </Label>
                        {dataLayers.map(layer => (
                          <div
                            key={layer.id}
                            className='flex items-center justify-between p-3 bg-white border rounded-lg border-slate-200'
                          >
                            <div className='flex-1 mr-3'>
                              <p className='text-sm font-medium text-slate-900'>
                                {layer.fileName}
                              </p>
                              <Input
                                value={layer.label}
                                onChange={e =>
                                  updateLayerLabel(layer.id, e.target.value)
                                }
                                placeholder='Display label'
                                className='h-8 mt-1 text-xs'
                              />
                              <p className='mt-1 text-xs text-slate-500'>
                                {formatFileSize(layer.size)}
                              </p>
                            </div>
                            <button
                              type='button'
                              onClick={() => removeDataLayer(layer.id)}
                              className='text-red-600 hover:text-red-700'
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
                                  d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                                />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Component Name */}
                  <div>
                    <Label htmlFor='component_name'>
                      Component Name <span className='text-red-500'>*</span>
                    </Label>
                    <Input
                      id='component_name'
                      value={formData.component_name}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          component_name: e.target.value,
                        })
                      }
                      placeholder='e.g., DowntownZoning'
                      className={errors.component_name ? 'border-red-500' : ''}
                    />
                    <p className='mt-1 text-xs text-slate-500'>
                      PascalCase (e.g., DowntownZoning). Register in
                      pages/maps/[slug].tsx after creation.
                    </p>
                    {errors.component_name && (
                      <p className='mt-1 text-sm text-red-600'>
                        {errors.component_name}
                      </p>
                    )}
                  </div>
                </>
              )}

              <div>
                <Label htmlFor='sort_order'>Sort Order</Label>
                <Input
                  id='sort_order'
                  type='number'
                  value={formData.sort_order}
                  onChange={e =>
                    setFormData({ ...formData, sort_order: e.target.value })
                  }
                  placeholder='0'
                />
                <p className='mt-1 text-xs text-slate-500'>
                  Lower numbers appear first
                </p>
              </div>

              <div className='flex justify-end pt-4 space-x-3 border-t border-slate-200'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => router.push('/admin/maps')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type='submit' disabled={loading}>
                  {loading ? (
                    <>
                      <div className='w-4 h-4 mr-2 border-b-2 border-white rounded-full animate-spin'></div>
                      Creating...
                    </>
                  ) : (
                    'Create Map'
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

export default function NewMapPage() {
  return (
    <ProtectedRoute requireAdmin>
      <NewMapContentEnhanced />
    </ProtectedRoute>
  )
}
