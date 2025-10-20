import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAllCompanies } from '@/lib/supabase/companies'
import { getAllMaps } from '@/lib/supabase/maps'
import { getAllProjects } from '@/lib/supabase/projects'
import { getAllUsers } from '@/lib/supabase/users'
import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'

type StatKey = 'companies' | 'users' | 'projects' | 'maps'
type IconKey = StatKey | 'access'

const icons: Record<IconKey, (className: string) => JSX.Element> = {
  companies: className => (
    <svg
      className={className}
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
  ),
  users: className => (
    <svg
      className={className}
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
  ),
  projects: className => (
    <svg
      className={className}
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
  ),
  maps: className => (
    <svg
      className={className}
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
  ),
  access: className => (
    <svg
      className={className}
      fill='none'
      stroke='currentColor'
      viewBox='0 0 24 24'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
      />
    </svg>
  ),
}

function AdminDashboardContent() {
  const [stats, setStats] = useState<Record<StatKey, number>>({
    companies: 0,
    users: 0,
    projects: 0,
    maps: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [companies, users, projects, maps] = await Promise.all([
          getAllCompanies(),
          getAllUsers(),
          getAllProjects(),
          getAllMaps(),
        ])

        setStats({
          companies: companies.length,
          users: users.length,
          projects: projects.length,
          maps: maps.length,
        })
      } catch (error) {
        // Handle error
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statDefinitions: Array<{
    key: StatKey
    label: string
    description: string
    iconKey: StatKey
    accentGradient: string
    iconAccent: string
  }> = [
    {
      key: 'companies',
      label: 'Companies',
      description: 'Client organizations under management',
      iconKey: 'companies',
      accentGradient: 'from-brand-primary/15 via-white/50 to-transparent',
      iconAccent: 'bg-brand-primary/15 text-brand-primary',
    },
    {
      key: 'users',
      label: 'Users',
      description: 'Licensed collaborators with access',
      iconKey: 'users',
      accentGradient: 'from-brand-accent/20 via-white/50 to-transparent',
      iconAccent: 'bg-brand-accent/15 text-brand-accent',
    },
    {
      key: 'projects',
      label: 'Projects',
      description: 'Active project workspaces',
      iconKey: 'projects',
      accentGradient: 'from-brand-secondary/20 via-white/50 to-transparent',
      iconAccent: 'bg-brand-secondary/20 text-brand-secondary-dark',
    },
    {
      key: 'maps',
      label: 'Maps',
      description: 'Published spatial experiences',
      iconKey: 'maps',
      accentGradient:
        'from-brand-primary-dark/15 via-brand-accent-light/30 to-transparent',
      iconAccent: 'bg-brand-primary-dark/15 text-brand-primary-dark',
    },
  ]

  const quickLinks: Array<{
    title: string
    description: string
    href: string
    iconKey: IconKey
    gradient: string
  }> = [
    {
      title: 'Manage Companies',
      description: 'Create and edit client organizations',
      href: '/admin/companies',
      iconKey: 'companies',
      gradient: 'from-brand-primary via-brand-primary-light to-brand-accent',
    },
    {
      title: 'Manage Users',
      description: 'Assign users to companies and set permissions',
      href: '/admin/users',
      iconKey: 'users',
      gradient: 'from-brand-accent via-brand-accent-light to-brand-primary',
    },
    {
      title: 'Manage Projects',
      description: 'Create projects and organize maps',
      href: '/admin/projects',
      iconKey: 'projects',
      gradient:
        'from-brand-secondary via-brand-secondary-light to-brand-accent',
    },
    {
      title: 'Manage Maps',
      description: 'Add and configure map metadata',
      href: '/admin/maps',
      iconKey: 'maps',
      gradient: 'from-brand-primary-dark via-brand-accent-dark to-brand-accent',
    },
    {
      title: 'Access Control',
      description: 'Assign projects to companies',
      href: '/admin/access',
      iconKey: 'access',
      gradient: 'from-brand-secondary-dark via-brand-primary to-brand-accent',
    },
  ]

  return (
    <AdminLayout>
      <Head>
        <title>Admin Dashboard - The Atlas</title>
      </Head>

      <div className='space-y-12'>
        <section className='relative overflow-hidden rounded-3xl border border-white/40 bg-gradient-to-br from-brand-primary via-brand-primary-light to-brand-accent text-white shadow-[0_45px_90px_rgba(10,61,98,0.28)]'>
          <div className='absolute -right-24 top-[-20%] h-80 w-80 rounded-full bg-white/25 blur-3xl' />
          <div className='absolute -left-10 bottom-[-30%] h-96 w-96 rounded-full bg-white/15 blur-3xl' />
          <div className='absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.35),_rgba(255,255,255,0))]' />

          <div className='relative grid gap-10 p-10 lg:grid-cols-[1.25fr_1fr] lg:items-center'>
            <div className='space-y-6'>
              <div className='inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] backdrop-blur'>
                Admin Mission Control
              </div>
              <h1 className='text-4xl font-semibold leading-tight sm:text-5xl'>
                <span className='text-white/75'>Keep the Atlas</span>{' '}
                <span className='block text-white'>orbiting smoothly.</span>
              </h1>
              <p className='max-w-2xl text-base text-white/80 sm:text-lg'>
                Oversee every organization, teammate, and experience from a
                single command center. Review status at a glance and launch into
                the tools you need in seconds.
              </p>

              <div className='flex flex-wrap items-center gap-3 pt-2'>
                <Link href='/admin/companies'>
                  <Button className='rounded-full bg-white px-6 py-2 text-brand-primary shadow-lg shadow-brand-primary/30 transition hover:shadow-xl hover:shadow-brand-primary/40'>
                    Create Company
                  </Button>
                </Link>
                <Link href='/admin/access'>
                  <Button
                    variant='ghost'
                    className='rounded-full border border-white/40 bg-white/10 px-6 py-2 text-white transition hover:bg-white/20'
                  >
                    Manage Access
                  </Button>
                </Link>
              </div>
            </div>

            <div className='space-y-5 rounded-3xl bg-white/10 p-6 backdrop-blur-xl shadow-inner shadow-brand-primary/30'>
              <div className='flex items-center justify-between gap-3'>
                <div>
                  <span className='text-xs uppercase tracking-[0.35em] text-white/60'>
                    Snapshot
                  </span>
                  <p className='text-lg font-semibold text-white'>
                    Live overview
                  </p>
                </div>
                <span className='inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs text-white/70'>
                  <span className='inline-flex h-2 w-2 rounded-full bg-emerald-300 animate-pulse' />
                  Synced
                </span>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                {statDefinitions.map(stat => (
                  <div
                    key={stat.key}
                    className='rounded-2xl border border-white/25 bg-white/10 p-4 text-white/80 backdrop-blur'
                  >
                    <div className='flex items-center justify-between'>
                      <span className='text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-white/60'>
                        {stat.label}
                      </span>
                      <span className='flex h-9 w-9 items-center justify-center rounded-2xl bg-white/15 text-white'>
                        {icons[stat.iconKey]('h-4 w-4')}
                      </span>
                    </div>
                    <p className='mt-2 text-2xl font-semibold text-white'>
                      {loading ? '...' : stats[stat.key].toLocaleString()}
                    </p>
                    <p className='text-xs text-white/60'>{stat.description}</p>
                  </div>
                ))}
              </div>
              <div className='rounded-2xl border border-white/20 bg-white/10 p-4 text-sm text-white/75'>
                Need support? Invite a teammate as an{' '}
                <span className='font-semibold text-white'>
                  additional admin
                </span>{' '}
                to share responsibilities.
              </div>
            </div>
          </div>
        </section>

        <section className='space-y-6'>
          <div className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between'>
            <div>
              <h2 className='text-2xl font-semibold text-slate-900'>
                Operational metrics
              </h2>
              <p className='text-sm text-slate-600'>
                Track the health of your Atlas ecosystem at a glance.
              </p>
            </div>
            <div className='inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 shadow-sm'>
              Updated automatically
            </div>
          </div>

          <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-4'>
            {statDefinitions.map(stat => (
              <Card
                key={stat.key}
                className='relative overflow-hidden rounded-3xl glass-panel card-hover'
              >
                <div
                  className={`pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br ${stat.accentGradient}`}
                />
                <CardHeader className='relative z-10 flex flex-row items-start justify-between gap-4 pb-4'>
                  <div>
                    <CardTitle className='text-sm font-semibold text-slate-800'>
                      {stat.label}
                    </CardTitle>
                    <p className='text-xs text-slate-500'>{stat.description}</p>
                  </div>
                  <span
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${stat.iconAccent}`}
                  >
                    {icons[stat.iconKey]('h-5 w-5')}
                  </span>
                </CardHeader>
                <CardContent className='relative z-10 space-y-3 pt-0'>
                  <p className='text-4xl font-semibold text-slate-900'>
                    {loading ? '...' : stats[stat.key].toLocaleString()}
                  </p>
                  <div className='flex items-center gap-2 text-xs font-medium text-brand-primary'>
                    <span className='inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse' />
                    Live data feed
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className='space-y-4'>
          <div className='flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
            <div>
              <h2 className='text-2xl font-semibold text-slate-900'>
                Quick actions
              </h2>
              <p className='text-sm text-slate-600'>
                Jump straight into the workflows you manage every day.
              </p>
            </div>
            <span className='inline-flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-slate-500'>
              <span className='inline-flex h-2 w-2 rounded-full bg-brand-secondary/80' />
              Priority tools
            </span>
          </div>

          <div className='grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3'>
            {quickLinks.map(link => (
              <Link key={link.href} href={link.href} className='group block'>
                <div
                  className={`relative overflow-hidden rounded-3xl border border-white/40 bg-gradient-to-br ${link.gradient} p-6 text-white shadow-[0_35px_70px_rgba(10,61,98,0.25)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_45px_90px_rgba(10,61,98,0.35)]`}
                >
                  <div className='absolute inset-0 opacity-0 transition-all duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.35),_rgba(255,255,255,0))]' />
                  <div className='relative space-y-5'>
                    <div className='flex items-center justify-between'>
                      <span className='flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white'>
                        {icons[link.iconKey]('h-6 w-6')}
                      </span>
                      <span className='flex h-10 w-10 items-center justify-center rounded-full border border-white/35 bg-white/10 text-white transition group-hover:border-white group-hover:bg-white group-hover:text-brand-primary'>
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
                      </span>
                    </div>
                    <div className='space-y-2'>
                      <h3 className='text-lg font-semibold leading-tight text-white'>
                        {link.title}
                      </h3>
                      <p className='text-sm text-white/80'>
                        {link.description}
                      </p>
                    </div>
                    <div className='flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/60'>
                      <span className='inline-flex h-2 w-2 rounded-full bg-white/80' />
                      Open tool
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </AdminLayout>
  )
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminDashboardContent />
    </ProtectedRoute>
  )
}
