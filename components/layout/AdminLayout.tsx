import { useAuth } from '@/contexts/AuthContext'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { ReactNode, useState } from 'react'
import { Button } from '../ui/button'
import { Toaster } from '../ui/toaster'

interface AdminLayoutProps {
  children: ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    {
      name: 'Overview',
      href: '/admin',
      icon: (
        <svg
          className='w-5 h-5'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
          />
        </svg>
      ),
    },
    {
      name: 'Companies',
      href: '/admin/companies',
      icon: (
        <svg
          className='w-5 h-5'
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
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: (
        <svg
          className='w-5 h-5'
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
    },
    {
      name: 'Projects',
      href: '/admin/projects',
      icon: (
        <svg
          className='w-5 h-5'
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
    },
    {
      name: 'Maps',
      href: '/admin/maps',
      icon: (
        <svg
          className='w-5 h-5'
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
    },
    {
      name: 'Access Control',
      href: '/admin/access',
      icon: (
        <svg
          className='w-5 h-5'
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
    },
  ]

  const isActive = (href: string) => {
    if (href === '/admin') {
      return router.pathname === href
    }
    return router.pathname.startsWith(href)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/login')
  }

  return (
    <div className='min-h-screen bg-slate-50'>
      {/* Top Navigation Bar */}
      <nav className='sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm'>
        <div className='px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between h-16'>
            <div className='flex items-center gap-4'>
              {/* Mobile menu button */}
              <button
                type='button'
                className='inline-flex items-center justify-center p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden'
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <svg
                  className='h-6 w-6'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth='1.5'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5'
                  />
                </svg>
              </button>

              {/* Logo */}
              <Link href='/dashboard' className='flex items-center'>
                <Image
                  src='/images/fldp_final_color.png'
                  alt='FLDP Logo'
                  width={140}
                  height={35}
                  className='h-9 w-auto'
                  priority
                />
              </Link>
              <div className='hidden md:flex items-center px-3 py-1 bg-brand-primary/10 text-brand-primary text-xs font-semibold rounded-full'>
                Admin Panel
              </div>
            </div>

            <div className='flex items-center gap-3'>
              <Link href='/dashboard'>
                <Button variant='ghost' size='sm' className='text-slate-600'>
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
                      d='M10 19l-7-7m0 0l7-7m-7 7h18'
                    />
                  </svg>
                  <span className='hidden sm:inline'>Dashboard</span>
                </Button>
              </Link>
              <div className='hidden md:flex items-center gap-2 text-sm text-slate-600 border-l border-slate-200 pl-3'>
                <div className='flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary text-white font-semibold text-xs'>
                  {user?.email?.[0]?.toUpperCase() || 'A'}
                </div>
                <span className='max-w-[150px] truncate'>{user?.email}</span>
              </div>
              <Button
                variant='outline'
                size='sm'
                onClick={handleSignOut}
                className='text-slate-700 hover:text-slate-900'
              >
                <span className='hidden sm:inline'>Sign Out</span>
                <svg
                  className='w-4 h-4 sm:hidden'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
                  />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className='flex'>
        {/* Desktop Sidebar */}
        <aside className='hidden lg:flex lg:flex-shrink-0'>
          <div className='flex flex-col w-64 border-r border-slate-200 bg-white'>
            <nav className='flex-1 px-4 py-6 space-y-1'>
              {navigation.map(item => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                    isActive(item.href)
                      ? 'bg-brand-primary text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-brand-primary'
                  }`}
                >
                  <span
                    className={
                      isActive(item.href)
                        ? 'text-white'
                        : 'text-slate-400 group-hover:text-brand-primary'
                    }
                  >
                    {item.icon}
                  </span>
                  <span className='ml-3'>{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div className='fixed inset-0 z-40 lg:hidden'>
            <div
              className='fixed inset-0 bg-slate-900/50'
              onClick={() => setSidebarOpen(false)}
            />
            <div className='fixed inset-y-0 left-0 flex flex-col w-64 bg-white border-r border-slate-200'>
              <div className='flex items-center justify-between h-16 px-4 border-b border-slate-200'>
                <span className='text-lg font-semibold text-slate-900'>
                  Admin Menu
                </span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className='p-2 rounded-md text-slate-600 hover:bg-slate-100'
                >
                  <svg
                    className='h-6 w-6'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth='1.5'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M6 18L18 6M6 6l12 12'
                    />
                  </svg>
                </button>
              </div>
              <nav className='flex-1 px-4 py-6 space-y-1 overflow-y-auto'>
                {navigation.map(item => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                      isActive(item.href)
                        ? 'bg-brand-primary text-white shadow-sm'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-brand-primary'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span
                      className={
                        isActive(item.href)
                          ? 'text-white'
                          : 'text-slate-400 group-hover:text-brand-primary'
                      }
                    >
                      {item.icon}
                    </span>
                    <span className='ml-3'>{item.name}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className='flex-1 overflow-auto'>
          <div className='px-4 py-8 sm:px-6 lg:px-8'>
            <div className='mx-auto max-w-7xl'>{children}</div>
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  )
}
