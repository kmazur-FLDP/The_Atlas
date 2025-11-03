import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { deleteCompany, getCompaniesWithStats } from '@/lib/supabase/companies'
import type { Company } from '@/types'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

function CompaniesContent() {
  const router = useRouter()
  const [companies, setCompanies] = useState<
    Array<Company & { user_count: number }>
  >([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const { toast } = useToast()

  const loadCompanies = async () => {
    setLoading(true)
    const data = await getCompaniesWithStats()
    setCompanies(data)
    setLoading(false)
  }

  // Load data on mount and whenever we navigate to this page
  useEffect(() => {
    if (router.isReady) {
      loadCompanies()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.asPath])

  const handleDelete = async (id: string, name: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${name}"? This action cannot be undone.`
      )
    ) {
      return
    }

    setDeleting(id)
    const { error } = await deleteCompany(id)

    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Success',
        description: `Company "${name}" has been deleted.`,
      })
      loadCompanies()
    }

    setDeleting(null)
  }

  return (
    <AdminLayout>
      <Head>
        <title>Manage Companies - Admin</title>
      </Head>

      <div>
        <div className='flex justify-between items-center mb-6'>
          <div>
            <h1 className='text-3xl font-bold text-slate-900'>Companies</h1>
            <p className='text-slate-600 mt-1'>
              Manage client organizations and their access
            </p>
          </div>
          <Link href='/admin/companies/new'>
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
              Add Company
            </Button>
          </Link>
        </div>

        {loading ? (
          <Card>
            <CardContent className='p-12 text-center'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
              <p className='text-slate-600'>Loading companies...</p>
            </CardContent>
          </Card>
        ) : companies.length === 0 ? (
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
                    d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
                  />
                </svg>
              </div>
              <h3 className='text-lg font-medium text-slate-900 mb-2'>
                No companies yet
              </h3>
              <p className='text-slate-600 mb-4'>
                Get started by creating your first company.
              </p>
              <Link href='/admin/companies/new'>
                <Button>Add Company</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {companies.map(company => (
              <Card
                key={company.id}
                className='hover:shadow-md transition-shadow'
              >
                <CardHeader>
                  <CardTitle className='flex items-center justify-between'>
                    <span className='truncate'>{company.name}</span>
                    <span className='text-sm font-normal text-slate-500 ml-2'>
                      {company.user_count}{' '}
                      {company.user_count === 1 ? 'user' : 'users'}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-sm text-slate-600 mb-4'>
                    <p>
                      Created:{' '}
                      {new Date(company.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className='flex space-x-2'>
                    <Link
                      href={`/admin/companies/${company.id}`}
                      className='flex-1'
                    >
                      <Button variant='outline' className='w-full' size='sm'>
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
                            d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                          />
                        </svg>
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleDelete(company.id, company.name)}
                      disabled={deleting === company.id}
                      className='text-red-600 hover:text-red-700 hover:bg-red-50'
                    >
                      {deleting === company.id ? (
                        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-red-600'></div>
                      ) : (
                        <svg
                          className='w-4 h-4'
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
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default function CompaniesPage() {
  return (
    <ProtectedRoute requireAdmin>
      <CompaniesContent />
    </ProtectedRoute>
  )
}
