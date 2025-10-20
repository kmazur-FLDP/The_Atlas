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
            {/* Welcome Section */}
            <section className='relative overflow-hidden rounded-3xl border border-white/30 bg-gradient-to-br from-brand-primary via-brand-primary-light to-brand-accent text-white shadow-[0_45px_90px_rgba(10,61,98,0.25)]'>
              <div className='absolute -right-20 top-[-20%] h-72 w-72 rounded-full bg-white/25 blur-3xl' />
              <div className='absolute -left-10 bottom-[-30%] h-80 w-80 rounded-full bg-white/15 blur-3xl' />
              <div className='absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.35),_rgba(255,255,255,0))]' />

              <div className='relative grid gap-8 p-10 lg:grid-cols-[1.2fr_1fr] lg:items-center'>
                <div className='space-y-6'>
                  <div className='inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium uppercase tracking-[0.3em] backdrop-blur'>
                    Welcome back
                  </div>
                  <h1 className='text-4xl font-semibold leading-tight sm:text-5xl'>
                    <span className='text-white/70'>Hi {displayName},</span>{' '}
                    <span className='block text-white'>
                      your atlas is ready.
                    </span>
                  </h1>
                  <p className='max-w-xl text-base text-white/80 sm:text-lg'>
                    Jump right into your projects, monitor activity, and surface
                    the parcel insights you rely on.
                  </p>

                  <div className='flex flex-wrap items-center gap-3 text-sm text-white/70'>
                    <div className='flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 backdrop-blur'>
                      <span className='inline-flex h-2 w-2 rounded-full bg-emerald-300' />
                      Account {isAdmin ? 'admin' : 'member'} access active
                    </div>
                    <div className='flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 backdrop-blur'>
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
                          d='M5 13l4 4L19 7'
                        />
                      </svg>
                      Secure workspace connection
                    </div>
                  </div>

                  <div className='flex flex-wrap items-center gap-3'>
                    <Link href='/maps'>
                      <Button className='rounded-full bg-white px-6 py-2 text-brand-primary shadow-lg shadow-brand-primary/30 transition hover:shadow-xl hover:shadow-brand-primary/40'>
                        Browse Maps
                      </Button>
                    </Link>
                    <Link href='/projects'>
                      <Button
                        variant='ghost'
                        className='rounded-full border border-white/40 bg-white/10 px-6 py-2 text-white transition hover:bg-white/20'
                      >
                        View Projects
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className='space-y-5 rounded-3xl bg-white/10 p-6 backdrop-blur-lg shadow-inner shadow-brand-primary/30'>
                  <div className='flex items-center gap-4 rounded-2xl bg-white/15 p-4 backdrop-blur'>
                    <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-brand-primary text-xl font-semibold shadow-inner'>
                      {initials}
                    </div>
                    <div className='flex flex-col'>
                      <span className='text-sm uppercase tracking-[0.2em] text-white/60'>
                        Profile
                      </span>
                      <span className='text-lg font-semibold'>
                        {displayName}
                      </span>
                      <span className='text-sm text-white/60'>
                        {user?.email}
                      </span>
                    </div>
                  </div>
                  <div className='grid gap-3 text-sm'>
                    <div className='flex items-center justify-between rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur'>
                      <span className='text-white/70'>Organization</span>
                      <span className='font-semibold text-white'>
                        {profile?.company?.name || 'Not assigned'}
                      </span>
                    </div>
                    <div className='flex items-center justify-between rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur'>
                      <span className='text-white/70'>Role</span>
                      <span className='font-semibold text-white'>
                        {isAdmin ? 'Administrator' : 'Member'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Stats Grid */}
            <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-4'>
              <Card className='glass-panel card-hover overflow-hidden'>
                <CardHeader className='flex flex-row items-center justify-between pb-4'>
                  <CardTitle className='text-sm font-semibold text-slate-800'>
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

              <Card className='glass-panel card-hover overflow-hidden'>
                <CardHeader className='flex flex-row items-center justify-between pb-4'>
                  <CardTitle className='text-sm font-semibold text-slate-800'>
                    Organization
                  </CardTitle>
                  <span className='inline-flex h-8 w-8 items-center justify-center rounded-xl bg-brand-secondary/10 text-brand-secondary'>
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
                        d='M4 6h16M4 10h16M4 14h16M4 18h16'
                      />
                    </svg>
                  </span>
                </CardHeader>
                <CardContent className='pt-2'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-2xl font-semibold text-slate-900'>
                        {profile?.company?.name || 'Pending'}
                      </p>
                      <p className='text-sm text-slate-500'>
                        {profile?.company_id
                          ? 'Active assignment'
                          : 'Awaiting assignment'}
                      </p>
                    </div>
                    <div className='h-20 w-20 rounded-full border border-brand-secondary/20 bg-brand-secondary/10' />
                  </div>
                </CardContent>
              </Card>

              <Card className='glass-panel card-hover overflow-hidden'>
                <CardHeader className='flex flex-row items-center justify-between pb-4'>
                  <CardTitle className='text-sm font-semibold text-slate-800'>
                    Projects
                  </CardTitle>
                  <span className='inline-flex h-8 w-8 items-center justify-center rounded-xl bg-brand-accent/10 text-brand-accent'>
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
                        d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                      />
                    </svg>
                  </span>
                </CardHeader>
                <CardContent className='pt-2'>
                  <p className='text-4xl font-semibold text-slate-900'>0</p>
                  <p className='text-sm text-slate-500'>Available projects</p>
                  <div className='mt-4 flex items-center gap-2 text-xs text-slate-500'>
                    <span className='inline-flex h-2 w-2 rounded-full bg-brand-accent/70' />
                    Track projects assigned to your organization in real time.
                  </div>
                </CardContent>
              </Card>

              <Card className='glass-panel card-hover overflow-hidden'>
                <CardHeader className='flex flex-row items-center justify-between pb-4'>
                  <CardTitle className='text-sm font-semibold text-slate-800'>
                    Maps
                  </CardTitle>
                  <span className='inline-flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600'>
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
                        d='M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7'
                      />
                    </svg>
                  </span>
                </CardHeader>
                <CardContent className='pt-2'>
                  <p className='text-4xl font-semibold text-slate-900'>0</p>
                  <p className='text-sm text-slate-500'>Available maps</p>
                  <div className='mt-4 flex items-center gap-2 text-xs text-slate-500'>
                    <span className='inline-flex h-2 w-2 rounded-full bg-emerald-400/70' />
                    Map previews and updates will appear here.
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className='grid gap-6 md:grid-cols-2'>
              <Link
                href='/maps'
                className='group relative block overflow-hidden rounded-3xl border border-white/40 bg-white/70 p-8 shadow-xl shadow-brand-primary/15 transition-all hover:-translate-y-1 hover:shadow-2xl backdrop-blur-xl'
              >
                <div className='absolute -right-20 top-[-40px] h-40 w-40 rounded-full bg-brand-accent/20 blur-3xl transition-all group-hover:bg-brand-accent/30' />
                <div className='relative flex items-center justify-between gap-6'>
                  <div>
                    <span className='inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-accent/10 text-brand-accent shadow-inner'>
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
                    <h3 className='mt-6 text-2xl font-semibold text-slate-900'>
                      Browse Maps
                    </h3>
                    <p className='mt-2 max-w-sm text-sm text-slate-600'>
                      Explore curated cartography and activate spatial stories
                      for your clients.
                    </p>
                  </div>
                  <div className='self-start rounded-full border border-brand-accent/30 bg-brand-accent/10 p-3 text-brand-accent transition-all group-hover:translate-x-1'>
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
                href='/projects'
                className='group relative block overflow-hidden rounded-3xl border border-white/40 bg-white/70 p-8 shadow-xl shadow-brand-primary/15 transition-all hover:-translate-y-1 hover:shadow-2xl backdrop-blur-xl'
              >
                <div className='absolute -left-16 bottom-[-40px] h-40 w-40 rounded-full bg-brand-secondary/20 blur-3xl transition-all group-hover:bg-brand-secondary/30' />
                <div className='relative flex items-center justify-between gap-6'>
                  <div>
                    <span className='inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-secondary/10 text-brand-secondary shadow-inner'>
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
                    <h3 className='mt-6 text-2xl font-semibold text-slate-900'>
                      View Projects
                    </h3>
                    <p className='mt-2 max-w-sm text-sm text-slate-600'>
                      Manage project pipelines, assign access, and stay ahead of
                      deliverables.
                    </p>
                  </div>
                  <div className='self-start rounded-full border border-brand-secondary/30 bg-brand-secondary/10 p-3 text-brand-secondary transition-all group-hover:translate-x-1'>
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
            <Card className='glass-panel overflow-hidden'>
              <CardHeader className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
                <CardTitle className='flex items-center gap-2 text-lg text-slate-900'>
                  <span className='inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary'>
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
                <CardDescription className='text-sm text-slate-500'>
                  Updates from your projects and map workspaces will appear
                  here.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='gridlines-overlay relative rounded-2xl border border-dashed border-slate-200/60 bg-white/60 p-10 text-center backdrop-blur'>
                  <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-inner shadow-brand-primary/20'>
                    <svg
                      className='h-8 w-8 text-slate-400'
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
                  <h3 className='mt-6 text-xl font-semibold text-slate-900'>
                    No activity yet
                  </h3>
                  <p className='mx-auto mt-3 max-w-md text-sm text-slate-600'>
                    As teams publish new maps, upload layers, or update
                    permissions, you’ll see the story unfold here in real time.
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
