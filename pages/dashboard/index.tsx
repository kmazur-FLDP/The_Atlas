import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { MainLayout } from '@/components/layout/MainLayout'
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
  const { user, profile, isAdmin } = useAuth()

  // Get display name - prefer profile name, fall back to email username
  const displayName = profile?.name || user?.email?.split('@')[0] || 'User'
  const initials = profile?.name
    ? profile.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || 'U'

  return (
    <>
      <Head>
        <title>Dashboard - The Atlas</title>
        <meta name='description' content='Your Atlas mapping dashboard' />
      </Head>

      <MainLayout>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          {/* Welcome Section */}
          <div className='mb-8'>
            <h1 className='text-4xl font-bold text-slate-900 mb-2'>
              Welcome back, {displayName}!
            </h1>
            <p className='text-lg text-slate-600'>
              Access your projects, maps, and manage your workspace.
            </p>
          </div>

          {/* Stats Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
            {/* Account Card */}
            <Card className='card-hover border-l-4 border-l-brand-primary'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-sm font-medium text-slate-600'>
                  Account
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex items-center'>
                  <div className='flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary text-sm font-bold'>
                    {initials}
                  </div>
                  <div className='ml-3 flex-1 min-w-0'>
                    <p className='text-sm font-medium text-slate-900 truncate'>
                      {displayName}
                    </p>
                    <p className='text-xs text-slate-500 truncate'>
                      {isAdmin ? '👑 Administrator' : '👤 User'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Company Card */}
            <Card className='card-hover border-l-4 border-l-brand-secondary'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-sm font-medium text-slate-600'>
                  Organization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex items-center'>
                  <div className='flex h-12 w-12 items-center justify-center rounded-full bg-brand-secondary/10 text-brand-secondary'>
                    <svg
                      className='w-6 h-6'
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
                  <div className='ml-3 flex-1 min-w-0'>
                    <p className='text-lg font-semibold text-slate-900 truncate'>
                      {profile?.company?.name || 'None'}
                    </p>
                    <p className='text-xs text-slate-500'>
                      {profile?.company_id ? 'Active' : 'Not assigned'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Projects Card */}
            <Card className='card-hover border-l-4 border-l-brand-accent'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-sm font-medium text-slate-600'>
                  Projects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex items-center'>
                  <div className='flex h-12 w-12 items-center justify-center rounded-full bg-brand-accent/10 text-brand-accent'>
                    <svg
                      className='w-6 h-6'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z'
                      />
                    </svg>
                  </div>
                  <div className='ml-3 flex-1 min-w-0'>
                    <p className='text-3xl font-bold text-slate-900'>0</p>
                    <p className='text-xs text-slate-500'>Available projects</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Maps Card */}
            <Card className='card-hover border-l-4 border-l-green-500'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-sm font-medium text-slate-600'>
                  Maps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex items-center'>
                  <div className='flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600'>
                    <svg
                      className='w-6 h-6'
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
                  <div className='ml-3 flex-1 min-w-0'>
                    <p className='text-3xl font-bold text-slate-900'>0</p>
                    <p className='text-xs text-slate-500'>Available maps</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
            <Link
              href='/maps'
              className='group block p-6 bg-white rounded-xl border border-slate-200 hover:border-brand-accent hover:shadow-lg transition-all'
            >
              <div className='flex items-center justify-between mb-4'>
                <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-brand-accent/10 text-brand-accent group-hover:bg-brand-accent group-hover:text-white transition-colors'>
                  <svg
                    className='w-6 h-6'
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
                <svg
                  className='w-5 h-5 text-slate-400 group-hover:text-brand-accent group-hover:translate-x-1 transition-all'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 5l7 7-7 7'
                  />
                </svg>
              </div>
              <h3 className='text-lg font-semibold text-slate-900 mb-2'>
                Browse Maps
              </h3>
              <p className='text-sm text-slate-600'>
                View and interact with available mapping projects
              </p>
            </Link>

            <Link
              href='/projects'
              className='group block p-6 bg-white rounded-xl border border-slate-200 hover:border-brand-primary hover:shadow-lg transition-all'
            >
              <div className='flex items-center justify-between mb-4'>
                <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors'>
                  <svg
                    className='w-6 h-6'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z'
                    />
                  </svg>
                </div>
                <svg
                  className='w-5 h-5 text-slate-400 group-hover:text-brand-primary group-hover:translate-x-1 transition-all'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 5l7 7-7 7'
                  />
                </svg>
              </div>
              <h3 className='text-lg font-semibold text-slate-900 mb-2'>
                View Projects
              </h3>
              <p className='text-sm text-slate-600'>
                Access your organization&apos;s project library
              </p>
            </Link>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <svg
                  className='w-5 h-5 text-slate-500'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
                Recent Activity
              </CardTitle>
              <CardDescription>
                Your recent projects and map interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='text-center py-12'>
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
                      d='M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4'
                    />
                  </svg>
                </div>
                <h3 className='text-lg font-medium text-slate-900 mb-2'>
                  No activity yet
                </h3>
                <p className='text-slate-600 max-w-md mx-auto'>
                  Start exploring maps and projects to see your activity here.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
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
