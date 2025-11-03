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
import { useRouter } from 'next/router'
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
  const router = useRouter()
  const [stats, setStats] = useState<Record<StatKey, number>>({
    companies: 0,
    users: 0,
    projects: 0,
    maps: 0,
  })
  const [loading, setLoading] = useState(true)

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

  useEffect(() => {
    fetchStats()
  }, [])

  // Reload data when navigating back to this page
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if (url === '/admin') {
        fetchStats()
      }
    }

    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])

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
        {/* Page Header */}
        <div className='space-y-4'>
          <div className='inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-neutral-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600'>
            Admin Dashboard
          </div>
          <div>
            <h1 className='text-4xl font-bold text-slate-900 leading-relaxed'>
              Keep the Atlas orbiting smoothly
            </h1>
            <p className='mt-3 max-w-2xl text-base text-slate-600 leading-relaxed'>
              Oversee every organization, teammate, and experience from a single
              command center.
            </p>
          </div>

          <div className='flex flex-wrap items-center gap-3 pt-2'>
            <Link href='/admin/companies'>
              <Button className='rounded-xl bg-brand-primary px-6 py-2 text-white shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-md'>
                Create Company
              </Button>
            </Link>
            <Link href='/admin/access'>
              <Button
                variant='outline'
                className='rounded-xl border-2 border-slate-200 px-6 py-2 text-slate-700 transition-colors hover:border-brand-primary hover:text-brand-primary'
              >
                Manage Access
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <section className='space-y-6'>
          <div className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between'>
            <div>
              <h2 className='text-2xl font-bold text-slate-900'>
                Operational metrics
              </h2>
              <p className='text-sm text-slate-600 leading-relaxed'>
                Track the health of your Atlas ecosystem at a glance.
              </p>
            </div>
            <div className='inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-neutral-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500'>
              <span className='inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse' />
              Live
            </div>
          </div>

          <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-4'>
            {statDefinitions.map(stat => (
              <Card
                key={stat.key}
                className='overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md'
              >
                <CardHeader className='flex flex-row items-start justify-between gap-4 pb-4'>
                  <div>
                    <CardTitle className='text-sm font-medium text-slate-700'>
                      {stat.label}
                    </CardTitle>
                    <p className='text-xs text-slate-500 leading-relaxed'>
                      {stat.description}
                    </p>
                  </div>
                  <span
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${stat.iconAccent}`}
                  >
                    {icons[stat.iconKey]('h-5 w-5')}
                  </span>
                </CardHeader>
                <CardContent className='space-y-2 pt-0'>
                  <p className='text-3xl font-bold text-slate-900'>
                    {loading ? '...' : stats[stat.key].toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className='space-y-4'>
          <div className='flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
            <div>
              <h2 className='text-2xl font-bold text-slate-900'>
                Quick actions
              </h2>
              <p className='text-sm text-slate-600 leading-relaxed'>
                Jump straight into the workflows you manage every day.
              </p>
            </div>
          </div>

          <div className='grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3'>
            {quickLinks.map(link => (
              <Link key={link.href} href={link.href} className='group block'>
                <div className='overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-6 transition-all duration-200 hover:border-brand-primary hover:shadow-md'>
                  <div className='flex items-center justify-between gap-6'>
                    <div>
                      <span className='inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary transition-colors duration-200 group-hover:bg-brand-primary group-hover:text-white'>
                        {icons[link.iconKey]('h-6 w-6')}
                      </span>
                      <h3 className='mt-6 text-xl font-bold text-slate-900 leading-tight'>
                        {link.title}
                      </h3>
                      <p className='mt-2 text-sm text-slate-600 leading-relaxed'>
                        {link.description}
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
