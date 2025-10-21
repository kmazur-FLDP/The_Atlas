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
import { createMap } from '@/lib/supabase/maps'
import { getAllProjects } from '@/lib/supabase/projects'
import type { Project } from '@/types'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

function NewMapContent() {
  const router = useRouter()
  const { toast } = useToast()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    project_id: '',
    name: '',
    url_slug: '',
    description: '',
    sort_order: '0',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const loadProjects = async () => {
      const data = await getAllProjects()
      setProjects(data)
      if (data.length > 0) {
        setFormData(prev => ({ ...prev, project_id: data[0].id }))
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
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
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
    } else {
      toast({
        title: 'Success',
        description: `Map "${formData.name}" has been created.`,
      })
      router.push('/admin/maps')
    }
  }

  const generateSlug = () => {
    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    setFormData({ ...formData, url_slug: slug })
  }

  return (
    <AdminLayout>
      <Head>
        <title>Add Map - Admin</title>
      </Head>

      <div className='max-w-2xl'>
        <div className='mb-6'>
          <h1 className='text-3xl font-bold text-slate-900'>Add Map</h1>
          <p className='text-slate-600 mt-1'>Create new map metadata</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Map Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-4'>
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
                  <p className='text-sm text-red-600 mt-1'>
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
                  placeholder='e.g., Downtown Zoning'
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className='text-sm text-red-600 mt-1'>{errors.name}</p>
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
                    className='ml-2 h-auto p-0'
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
                <p className='text-xs text-slate-500 mt-1'>
                  Will be accessible at /maps/{formData.url_slug || 'your-slug'}
                </p>
                {errors.url_slug && (
                  <p className='text-sm text-red-600 mt-1'>{errors.url_slug}</p>
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
                <p className='text-xs text-slate-500 mt-1'>
                  Lower numbers appear first
                </p>
              </div>

              <div className='flex justify-end space-x-3 pt-4'>
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
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
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
      <NewMapContent />
    </ProtectedRoute>
  )
}
