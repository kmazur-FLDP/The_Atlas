import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import Head from 'next/head'
import Link from 'next/link'

function DashboardContent() {
  const { user, profile, isAdmin, signOut } = useAuth()

  return (
    <>
      <Head>
        <title>Dashboard - The Atlas</title>
        <meta name='description' content='Your Atlas mapping dashboard' />
      </Head>

      <div className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100'>
        {/* Header */}
        <header className='bg-white shadow-sm border-b'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='flex justify-between items-center py-4'>
              <div className='flex items-center'>
                <h1 className='text-2xl font-bold text-slate-900'>
                  The <span className='text-blue-600'>Atlas</span>
                </h1>
              </div>

              <div className='flex items-center space-x-4'>
                <span className='text-sm text-slate-600'>
                  Welcome, {user?.email}
                </span>
                {isAdmin && (
                  <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                    Admin
                  </span>
                )}
                <Button variant='outline' size='sm' onClick={() => signOut()}>
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>
          <div className='px-4 py-6 sm:px-0'>
            <div className='mb-8'>
              <h2 className='text-3xl font-bold text-slate-900 mb-2'>
                Dashboard
              </h2>
              <p className='text-slate-600'>
                Welcome to your Atlas mapping platform. Access your projects and
                maps below.
              </p>
            </div>

            {/* User Info Card */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>Account Information</CardTitle>
                </CardHeader>
                <CardContent className='space-y-2'>
                  <div>
                    <span className='text-sm font-medium text-slate-500'>
                      Email:
                    </span>
                    <p className='text-sm text-slate-900'>{user?.email}</p>
                  </div>
                  <div>
                    <span className='text-sm font-medium text-slate-500'>
                      Company:
                    </span>
                    <p className='text-sm text-slate-900'>
                      {profile?.company?.name || 'Not assigned'}
                    </p>
                  </div>
                  <div>
                    <span className='text-sm font-medium text-slate-500'>
                      Role:
                    </span>
                    <p className='text-sm text-slate-900'>
                      {isAdmin ? 'Administrator' : 'User'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <Link
                    href='/projects'
                    className='block w-full text-left p-2 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm transition-colors'
                  >
                    View Projects
                  </Link>
                  <Link
                    href='/maps'
                    className='block w-full text-left p-2 rounded-md bg-green-50 hover:bg-green-100 text-green-700 text-sm transition-colors'
                  >
                    Browse Maps
                  </Link>
                  {isAdmin && (
                    <Link
                      href='/admin'
                      className='block w-full text-left p-2 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-700 text-sm transition-colors'
                    >
                      Admin Panel
                    </Link>
                  )}
                </CardContent>
              </Card>

              {/* Status */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>System Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='flex items-center space-x-2'>
                    <div className='w-3 h-3 bg-green-400 rounded-full'></div>
                    <span className='text-sm text-slate-600'>
                      All systems operational
                    </span>
                  </div>
                  <p className='text-xs text-slate-500 mt-2'>
                    Last updated: {new Date().toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Projects Section (placeholder) */}
            <Card>
              <CardHeader>
                <CardTitle>Your Projects</CardTitle>
                <CardDescription>
                  Projects and maps available to your organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='text-center py-8'>
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
                        d='M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7'
                      />
                    </svg>
                  </div>
                  <h3 className='text-lg font-medium text-slate-900 mb-2'>
                    No projects yet
                  </h3>
                  <p className='text-slate-600 mb-4'>
                    {isAdmin
                      ? 'Create your first project to get started with mapping.'
                      : "Your organization hasn't been assigned to any projects yet."}
                  </p>
                  {isAdmin && (
                    <Button>
                      <Link href='/admin/projects'>Create Project</Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
