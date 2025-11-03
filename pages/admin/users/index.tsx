import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { getAllCompanies } from '@/lib/supabase/companies'
import {
  getAllUsers,
  toggleAdminStatus,
  updateUser,
} from '@/lib/supabase/users'
import type { Company, User } from '@/types'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

function UsersContent() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const { toast } = useToast()

  const loadData = async () => {
    setLoading(true)
    const [usersData, companiesData] = await Promise.all([
      getAllUsers(),
      getAllCompanies(),
    ])
    setUsers(usersData)
    setCompanies(companiesData)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  // Reload data when navigating back to this page
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if (url === '/admin/users') {
        loadData()
      }
    }

    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])

  const handleCompanyChange = async (userId: string, companyId: string) => {
    setUpdating(userId)
    const { error } = await updateUser(userId, {
      company_id: companyId === 'none' ? null : companyId,
    })

    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Success',
        description: 'User company has been updated.',
      })
      loadData()
    }
    setUpdating(null)
  }

  const handleAdminToggle = async (userId: string, isAdmin: boolean) => {
    setUpdating(userId)
    const { error } = await toggleAdminStatus(userId, !isAdmin)

    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Success',
        description: `User ${!isAdmin ? 'granted' : 'removed from'} admin access.`,
      })
      loadData()
    }
    setUpdating(null)
  }

  return (
    <AdminLayout>
      <Head>
        <title>Manage Users - Admin</title>
      </Head>

      <div>
        <div className='flex justify-between items-center mb-6'>
          <div>
            <h1 className='text-3xl font-bold text-slate-900'>Users</h1>
            <p className='text-slate-600 mt-1'>
              Manage user accounts and permissions
            </p>
          </div>
        </div>

        {loading ? (
          <Card>
            <CardContent className='p-12 text-center'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
              <p className='text-slate-600'>Loading users...</p>
            </CardContent>
          </Card>
        ) : users.length === 0 ? (
          <Card>
            <CardContent className='p-12 text-center'>
              <div className='w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center'>
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
                    d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
                  />
                </svg>
              </div>
              <h3 className='text-lg font-medium text-slate-900 mb-2'>
                No users yet
              </h3>
              <p className='text-slate-600'>
                Users will appear here after they sign up.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-slate-50 border-b border-slate-200'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider'>
                      Email
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider'>
                      Company
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider'>
                      Admin
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider'>
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-slate-200'>
                  {users.map(user => (
                    <tr key={user.id} className='hover:bg-slate-50'>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm font-medium text-slate-900'>
                          {user.email}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <Select
                          value={user.company_id || 'none'}
                          onValueChange={value =>
                            handleCompanyChange(user.id, value)
                          }
                          disabled={updating === user.id}
                        >
                          <SelectTrigger className='w-48'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='none'>No company</SelectItem>
                            {companies.map(company => (
                              <SelectItem key={company.id} value={company.id}>
                                {company.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <Switch
                          checked={user.is_admin}
                          onCheckedChange={() =>
                            handleAdminToggle(user.id, user.is_admin)
                          }
                          disabled={updating === user.id}
                        />
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-slate-500'>
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}

export default function UsersPage() {
  return (
    <ProtectedRoute requireAdmin>
      <UsersContent />
    </ProtectedRoute>
  )
}
