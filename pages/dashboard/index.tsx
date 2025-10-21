import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { MainLayout } from '@/components/layout/MainLayout'
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
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='space-y-10 py-10'>
            {/* Page Header */}
            <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
              <div>
                <h1 className='text-4xl font-bold text-slate-900'>
                  Welcome back, {displayName}
                </h1>
                <p className='mt-2 text-base text-slate-600 leading-relaxed'>
                  {profile?.company?.name || 'Your dashboard'} •{' '}
                  {isAdmin ? 'Administrator' : 'Member'}
                </p>
              </div>
              <div className='flex flex-wrap items-center gap-3'>
                <Link href='/maps'>
                  <Button className='rounded-xl bg-brand-primary px-6 py-2.5 text-white shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:bg-brand-primary-dark active:scale-[0.98]'>
                    Browse Maps
                  </Button>
                </Link>
                <Link href='/projects'>
                  <Button
                    variant='outline'
                    className='rounded-xl border-slate-300 px-6 py-2.5 text-slate-700 transition-all duration-200 hover:bg-slate-50 hover:border-brand-primary/40'
                  >
                    View Projects
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats Grid */}
            <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-4'>
              <Card className='overflow-hidden border border-slate-200/70 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md'>
                <CardHeader className='flex flex-row items-center justify-between pb-4'>
                  <CardTitle className='text-sm font-medium text-slate-700'>
                    Account
                  </CardTitle>
                  <span className='inline-flex h-8 w-8 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary'>
                    <svg
                      className='h-4 w-4'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5.121 17.804A4 4 0 019 16h6a4 4 0 013.879 1.804M15 7a3 3 0 01-6 0 3 3 0 016 0z'
                      />
                    </svg>
                  </span>
                </CardHeader>
                <CardContent className='pt-2'>
                  <div className='flex items-center gap-4'>
                    <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary text-base font-semibold'>
                      {initials}
                    </div>
                    <div className='min-w-0'>
                      <p className='truncate text-lg font-semibold text-slate-900'>
                        {displayName}
                      </p>
                      <p className='text-sm text-slate-500'>
                        {isAdmin ? 'Administrator' : 'Collaborator'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className='overflow-hidden border border-slate-200/70 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md'>
                <CardHeader className='flex flex-row items-center justify-between pb-4'>
                  <CardTitle className='text-sm font-medium text-slate-700'>
                    Organization
                  </CardTitle>
                  <span className='inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600'>
                    <svg
                      className='h-5 w-5'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M4 6h16M4 10h16M4 14h16M4 18h16'
                      />
                    </svg>
                  </span>
                </CardHeader>
                <CardContent className='pt-2'>
                  <p className='text-2xl font-bold text-slate-900'>
                    {profile?.company?.name || 'Pending'}
                  </p>
                  <p className='text-sm text-slate-500 mt-1 leading-relaxed'>
                    {profile?.company_id
                      ? 'Active assignment'
                      : 'Awaiting assignment'}
                  </p>
                </CardContent>
              </Card>

              <Card className='overflow-hidden border border-slate-200/70 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md'>
                <CardHeader className='flex flex-row items-center justify-between pb-4'>
                  <CardTitle className='text-sm font-medium text-slate-700'>
                    Projects
                  </CardTitle>
                  <span className='inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-accent/10 text-brand-accent'>
                    <svg
                      className='h-5 w-5'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                      />
                    </svg>
                  </span>
                </CardHeader>
                <CardContent className='pt-2'>
                  <p className='text-4xl font-bold text-slate-900'>0</p>
                  <p className='text-sm text-slate-500 mt-1'>
                    Available projects
                  </p>
                  <div className='mt-4 flex items-center gap-2 text-xs text-slate-500 leading-relaxed'>
                    <span className='inline-flex h-2 w-2 rounded-full bg-brand-accent animate-pulse' />
                    Track projects in real time
                  </div>
                </CardContent>
              </Card>

              <Card className='overflow-hidden border border-slate-200/70 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md'>
                <CardHeader className='flex flex-row items-center justify-between pb-4'>
                  <CardTitle className='text-sm font-medium text-slate-700'>
                    Maps
                  </CardTitle>
                  <span className='inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600'>
                    <svg
                      className='h-5 w-5'
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
                  </span>
                </CardHeader>
                <CardContent className='pt-2'>
                  <p className='text-4xl font-bold text-slate-900'>0</p>
                  <p className='text-sm text-slate-500 mt-1'>Available maps</p>
                  <div className='mt-4 flex items-center gap-2 text-xs text-slate-500 leading-relaxed'>
                    <span className='inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse' />
                    Map previews appear here
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className='grid gap-6 md:grid-cols-2'>
              <Link
                href='/projects'
                className='group block overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-8 transition-all duration-200 hover:border-brand-primary hover:shadow-md'
              >
                <div className='flex items-center justify-between gap-6'>
                  <div>
                    <span className='inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary transition-colors duration-200 group-hover:bg-brand-primary group-hover:text-white'>
                      <svg
                        className='h-6 w-6'
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
                    </span>
                    <h3 className='mt-6 text-2xl font-bold text-slate-900'>
                      View Projects
                    </h3>
                    <p className='mt-2 max-w-sm text-sm text-slate-600 leading-relaxed'>
                      Manage project pipelines, assign access, and stay ahead of
                      deliverables.
                    </p>
                  </div>
                  <div className='flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-200 text-slate-400 transition-all duration-200 group-hover:translate-x-1 group-hover:border-brand-primary group-hover:text-brand-primary'>
                    <svg
                      className='h-5 w-5'
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
                </div>
              </Link>

              <Link
                href='/maps'
                className='group block overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-8 transition-all duration-200 hover:border-brand-accent hover:shadow-md'
              >
                <div className='flex items-center justify-between gap-6'>
                  <div>
                    <span className='inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-accent/10 text-brand-accent transition-colors duration-200 group-hover:bg-brand-accent group-hover:text-white'>
                      <svg
                        className='h-6 w-6'
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
                    </span>
                    <h3 className='mt-6 text-2xl font-bold text-slate-900'>
                      Browse Maps
                    </h3>
                    <p className='mt-2 max-w-sm text-sm text-slate-600 leading-relaxed'>
                      Explore curated cartography and activate spatial stories
                      for your clients.
                    </p>
                  </div>
                  <div className='flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-200 text-slate-400 transition-all duration-200 group-hover:translate-x-1 group-hover:border-brand-accent group-hover:text-brand-accent'>
                    <svg
                      className='h-5 w-5'
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
                </div>
              </Link>
            </div>

            {/* Recent Activity */}
            <Card className='overflow-hidden border border-slate-200/70 bg-white shadow-sm'>
              <CardHeader className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
                <CardTitle className='flex items-center gap-3 text-lg font-bold text-slate-900'>
                  <span className='inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600'>
                    <svg
                      className='h-5 w-5'
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
                  </span>
                  Activity timeline
                </CardTitle>
                <CardDescription className='text-sm text-slate-500 leading-relaxed'>
                  Updates from your projects appear here
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='relative rounded-2xl border-2 border-dashed border-slate-200 bg-neutral-50 p-10 text-center'>
                  <div className='inline-flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 text-slate-400'>
                    <svg
                      className='h-7 w-7'
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
                  <h3 className='mt-6 text-lg font-bold text-slate-700'>
                    No activity yet
                  </h3>
                  <p className='mx-auto mt-2 max-w-md text-sm text-slate-500 leading-relaxed'>
                    As teams publish new maps or update permissions, you&apos;ll
                    see the story unfold here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
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
