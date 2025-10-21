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
      name: 'Shared Layers',
      href: '/admin/layers',
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
            d='M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z'
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
    <div className='relative min-h-screen overflow-hidden bg-gradient-to-br from-brand-primary/5 via-white to-brand-accent/10'>
      <div className='pointer-events-none absolute inset-0'>
        <div className='absolute -left-32 top-28 h-96 w-96 rounded-full bg-brand-primary/15 blur-3xl' />
        <div className='absolute right-[-8%] top-0 h-80 w-80 rounded-full bg-brand-accent/14 blur-3xl' />
        <div className='absolute bottom-[-20%] left-1/3 h-[28rem] w-[28rem] rounded-full bg-brand-secondary/16 blur-3xl' />
      </div>

      {/* Top Navigation Bar */}
      <nav className='sticky top-0 z-50 overflow-hidden border-b border-white/30 bg-gradient-to-r from-brand-primary via-brand-primary-light to-brand-accent text-white shadow-[0_25px_60px_rgba(10,61,98,0.3)]'>
        <div className='px-4 sm:px-6 lg:px-8'>
          <div className='flex h-16 items-center justify-between'>
            <div className='flex items-center gap-4'>
              {/* Mobile menu button */}
              <button
                type='button'
                className='inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 p-2 text-white transition hover:bg-white/20 lg:hidden'
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
                <span className='sr-only'>The Atlas</span>
                <div className='flex items-center rounded-2xl border border-white/30 bg-white/90 px-4 py-2 shadow-lg shadow-brand-primary/25'>
                  <Image
                    src='/images/fldp_final_color.png'
                    alt='FLDP Logo'
                    width={200}
                    height={50}
                    className='h-12 w-auto'
                    priority
                  />
                </div>
              </Link>
              <div className='hidden md:flex items-center rounded-full border border-white/30 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-white/80 backdrop-blur'>
                Admin Console
              </div>
            </div>

            <div className='flex items-center gap-3 text-sm text-white/80'>
              <Link href='/dashboard'>
                <Button
                  variant='ghost'
                  size='sm'
                  className='rounded-full border border-white/30 bg-white/10 px-4 text-white transition hover:bg-white/20'
                >
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
              <div className='hidden border-l border-white/30 pl-4 md:flex items-center gap-2'>
                <div className='flex h-9 w-9 items-center justify-center rounded-full bg-white text-brand-primary font-semibold text-sm shadow-inner'>
                  {user?.email?.[0]?.toUpperCase() || 'A'}
                </div>
                <span className='max-w-[150px] truncate text-white'>
                  {user?.email}
                </span>
              </div>
              <Button
                size='sm'
                onClick={handleSignOut}
                className='rounded-full bg-white/90 px-4 text-brand-primary transition hover:bg-white'
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
          <div className='flex w-72 flex-col border-r border-white/40 bg-white/70 backdrop-blur-xl shadow-[0_25px_60px_rgba(10,61,98,0.18)]'>
            <nav className='flex-1 space-y-1 px-5 py-6'>
              {navigation.map(item => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                    isActive(item.href)
                      ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30'
                      : 'text-slate-600 hover:bg-white/60 hover:text-brand-primary'
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
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div className='fixed inset-0 z-40 lg:hidden'>
            <div
              className='fixed inset-0 bg-brand-primary/60 backdrop-blur-sm'
              onClick={() => setSidebarOpen(false)}
            />
            <div className='fixed inset-y-0 left-0 flex w-72 flex-col border-r border-white/30 bg-white/80 backdrop-blur-xl'>
              <div className='flex h-16 items-center justify-between border-b border-white/30 px-5'>
                <span className='text-lg font-semibold text-brand-primary'>
                  Admin Menu
                </span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className='rounded-full border border-white/40 bg-white/20 p-2 text-slate-600 hover:bg-white/40'
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
              <nav className='flex-1 space-y-1 overflow-y-auto px-5 py-6'>
                {navigation.map(item => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                      isActive(item.href)
                        ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30'
                        : 'text-slate-600 hover:bg-white/60 hover:text-brand-primary'
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
        <main className='relative z-10 flex-1 overflow-auto'>
          <div className='px-4 py-10 sm:px-6 lg:px-8'>
            <div className='mx-auto max-w-7xl'>{children}</div>
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  )
}
