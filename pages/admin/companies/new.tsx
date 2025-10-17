import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { createCompany } from '@/lib/supabase/companies'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState } from 'react'

function NewCompanyContent() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [errors, setErrors] = useState<{ name?: string }>({})

  const validate = () => {
    const newErrors: { name?: string } = {}

    if (!name.trim()) {
      newErrors.name = 'Company name is required'
    } else if (name.trim().length < 2) {
      newErrors.name = 'Company name must be at least 2 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setLoading(true)
    const { error } = await createCompany({ name: name.trim() })

    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      })
      setLoading(false)
    } else {
      toast({
        title: 'Success',
        description: `Company "${name}" has been created.`,
      })
      router.push('/admin/companies')
    }
  }

  return (
    <AdminLayout>
      <Head>
        <title>Add Company - Admin</title>
      </Head>

      <div className='max-w-2xl'>
        <div className='mb-6'>
          <h1 className='text-3xl font-bold text-slate-900'>Add Company</h1>
          <p className='text-slate-600 mt-1'>
            Create a new client organization
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div>
                <Label htmlFor='name'>
                  Company Name <span className='text-red-500'>*</span>
                </Label>
                <Input
                  id='name'
                  type='text'
                  value={name}
                  onChange={e => {
                    setName(e.target.value)
                    if (errors.name) setErrors({ ...errors, name: undefined })
                  }}
                  placeholder='e.g., Acme Corporation'
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className='text-sm text-red-600 mt-1'>{errors.name}</p>
                )}
              </div>

              <div className='flex justify-end space-x-3 pt-4'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => router.push('/admin/companies')}
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
                    'Create Company'
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

export default function NewCompanyPage() {
  return (
    <ProtectedRoute requireAdmin>
      <NewCompanyContent />
    </ProtectedRoute>
  )
}
