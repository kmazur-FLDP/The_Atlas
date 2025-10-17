import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { createProject } from '@/lib/supabase/projects'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState } from 'react'

function NewProjectContent() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [errors, setErrors] = useState<{ name?: string }>({})

  const validate = () => {
    const newErrors: { name?: string } = {}
    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    const { error } = await createProject({
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
    })

    if (error) {
      toast({ title: 'Error', description: error, variant: 'destructive' })
      setLoading(false)
    } else {
      toast({
        title: 'Success',
        description: `Project "${formData.name}" has been created.`,
      })
      router.push('/admin/projects')
    }
  }

  return (
    <AdminLayout>
      <Head>
        <title>Add Project - Admin</title>
      </Head>

      <div className='max-w-2xl'>
        <div className='mb-6'>
          <h1 className='text-3xl font-bold text-slate-900'>Add Project</h1>
          <p className='text-slate-600 mt-1'>Create a new mapping project</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div>
                <Label htmlFor='name'>
                  Project Name <span className='text-red-500'>*</span>
                </Label>
                <Input
                  id='name'
                  value={formData.name}
                  onChange={e =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder='e.g., Downtown Development'
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className='text-sm text-red-600 mt-1'>{errors.name}</p>
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
                  placeholder='Brief description of the project...'
                  rows={4}
                  className='w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>

              <div className='flex justify-end space-x-3 pt-4'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => router.push('/admin/projects')}
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
                    'Create Project'
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

export default function NewProjectPage() {
  return (
    <ProtectedRoute requireAdmin>
      <NewProjectContent />
    </ProtectedRoute>
  )
}
