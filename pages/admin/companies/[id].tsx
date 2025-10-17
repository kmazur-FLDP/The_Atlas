import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { getCompanyById, updateCompany } from '@/lib/supabase/companies'
import { getUsersByCompany } from '@/lib/supabase/users'
import type { Company, User } from '@/types'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

function EditCompanyContent() {
  const router = useRouter()
  const { id } = router.query
  const { toast } = useToast()

  const [company, setCompany] = useState<Company | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [errors, setErrors] = useState<{ name?: string }>({})

  useEffect(() => {
    if (id && typeof id === 'string') {
      loadCompany(id)
      loadUsers(id)
    }
  }, [id])

  const loadCompany = async (companyId: string) => {
    const data = await getCompanyById(companyId)
    if (data) {
      setCompany(data)
      setName(data.name)
    } else {
      toast({
        title: 'Error',
        description: 'Company not found',
        variant: 'destructive',
      })
      router.push('/admin/companies')
    }
    setLoading(false)
  }

  const loadUsers = async (companyId: string) => {
    const data = await getUsersByCompany(companyId)
    setUsers(data)
  }

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

    if (!validate() || !company) return

    setSaving(true)
    const { error } = await updateCompany(company.id, {
      name: name.trim(),
    })

    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      })
      setSaving(false)
    } else {
      toast({
        title: 'Success',
        description: 'Company has been updated.',
      })
      router.push('/admin/companies')
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className='flex items-center justify-center h-64'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
            <p className='text-slate-600'>Loading company...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <Head>
        <title>Edit Company - Admin</title>
      </Head>

      <div className='max-w-4xl'>
        <div className='mb-6'>
          <h1 className='text-3xl font-bold text-slate-900'>Edit Company</h1>
          <p className='text-slate-600 mt-1'>Update company information</p>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Company Form */}
          <div className='lg:col-span-2'>
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
                        if (errors.name)
                          setErrors({ ...errors, name: undefined })
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
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                    <Button type='submit' disabled={saving}>
                      {saving ? (
                        <>
                          <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Users List */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Assigned Users</CardTitle>
              </CardHeader>
              <CardContent>
                {users.length === 0 ? (
                  <p className='text-sm text-slate-500 text-center py-4'>
                    No users assigned yet
                  </p>
                ) : (
                  <ul className='space-y-2'>
                    {users.map(user => (
                      <li
                        key={user.id}
                        className='text-sm text-slate-700 flex items-center justify-between'
                      >
                        <span className='truncate'>{user.email}</span>
                        {user.is_admin && (
                          <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 ml-2'>
                            Admin
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
                <div className='mt-4'>
                  <Link href='/admin/users'>
                    <Button variant='outline' size='sm' className='w-full'>
                      Manage Users
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default function EditCompanyPage() {
  return (
    <ProtectedRoute requireAdmin>
      <EditCompanyContent />
    </ProtectedRoute>
  )
}
