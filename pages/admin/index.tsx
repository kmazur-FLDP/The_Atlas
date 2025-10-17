import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAllCompanies } from '@/lib/supabase/companies'
import { getAllMaps } from '@/lib/supabase/maps'
import { getAllProjects } from '@/lib/supabase/projects'
import { getAllUsers } from '@/lib/supabase/users'
import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'

function AdminDashboardContent() {
  const [stats, setStats] = useState({
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

  const quickLinks = [
    {
      title: 'Manage Companies',
      description: 'Create and edit client organizations',
      href: '/admin/companies',
      icon: (
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
      ),
      color: 'blue',
    },
    {
      title: 'Manage Users',
      description: 'Assign users to companies and set permissions',
      href: '/admin/users',
      icon: (
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
            d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
          />
        </svg>
      ),
      color: 'green',
    },
    {
      title: 'Manage Projects',
      description: 'Create projects and organize maps',
      href: '/admin/projects',
      icon: (
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
      ),
      color: 'purple',
    },
    {
      title: 'Manage Maps',
      description: 'Add and configure map metadata',
      href: '/admin/maps',
      icon: (
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
      ),
      color: 'orange',
    },
    {
      title: 'Access Control',
      description: 'Assign projects to companies',
      href: '/admin/access',
      icon: (
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
            d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
          />
        </svg>
      ),
      color: 'red',
    },
  ]

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    green: 'bg-green-50 text-green-600 hover:bg-green-100',
    purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
    orange: 'bg-orange-50 text-orange-600 hover:bg-orange-100',
    red: 'bg-red-50 text-red-600 hover:bg-red-100',
  }

  return (
    <AdminLayout>
      <Head>
        <title>Admin Dashboard - The Atlas</title>
      </Head>

      <div>
        <h1 className='text-3xl font-bold text-slate-900 mb-2'>
          Admin Dashboard
        </h1>
        <p className='text-slate-600 mb-8'>
          Manage companies, users, projects, and maps from this central
          location.
        </p>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium text-slate-600'>
                Companies
              </CardTitle>
              <svg
                className='w-4 h-4 text-slate-400'
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
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {loading ? '...' : stats.companies}
              </div>
              <p className='text-xs text-slate-500 mt-1'>
                Client organizations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium text-slate-600'>
                Users
              </CardTitle>
              <svg
                className='w-4 h-4 text-slate-400'
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
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {loading ? '...' : stats.users}
              </div>
              <p className='text-xs text-slate-500 mt-1'>Registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium text-slate-600'>
                Projects
              </CardTitle>
              <svg
                className='w-4 h-4 text-slate-400'
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
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {loading ? '...' : stats.projects}
              </div>
              <p className='text-xs text-slate-500 mt-1'>Active projects</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium text-slate-600'>
                Maps
              </CardTitle>
              <svg
                className='w-4 h-4 text-slate-400'
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
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {loading ? '...' : stats.maps}
              </div>
              <p className='text-xs text-slate-500 mt-1'>Total maps</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div>
          <h2 className='text-xl font-semibold text-slate-900 mb-4'>
            Quick Actions
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {quickLinks.map(link => (
              <Link key={link.href} href={link.href}>
                <Card className='hover:shadow-md transition-shadow cursor-pointer h-full'>
                  <CardContent className='p-6'>
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                        colorClasses[link.color as keyof typeof colorClasses]
                      }`}
                    >
                      {link.icon}
                    </div>
                    <h3 className='font-semibold text-slate-900 mb-1'>
                      {link.title}
                    </h3>
                    <p className='text-sm text-slate-600'>{link.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
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
