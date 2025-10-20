import { useAuth } from '@/contexts/AuthContext'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { Button } from '../ui/button'

export function Header() {
  const router = useRouter()
  const { user, profile, isAuthenticated, isAdmin, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/login')
  }

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

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', show: isAuthenticated },
    { name: 'Maps', href: '/maps', show: isAuthenticated },
    { name: 'Admin', href: '/admin', show: isAdmin },
  ].filter(item => item.show)

  return (
    <header className='sticky top-0 z-50 w-full overflow-hidden border-b border-white/20 bg-transparent'>
      <div className='absolute inset-0 bg-gradient-to-r from-brand-primary via-brand-primary-light to-brand-accent' />
      <div className='absolute inset-0 opacity-80 backdrop-blur-xl' />
      <div className='absolute inset-0 pointer-events-none'>
        <div className='absolute -left-24 top-6 h-48 w-48 rounded-full bg-white/15 blur-3xl' />
        <div className='absolute right-16 -top-16 h-40 w-40 rounded-full bg-white/10 blur-2xl' />
      </div>

      <nav className='relative mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8'>
        {/* Logo */}
        <div className='flex items-center gap-6 lg:flex-1'>
          <Link
            href={isAuthenticated ? '/dashboard' : '/'}
            className='flex items-center'
          >
            <span className='sr-only'>The Atlas</span>
            <div className='flex items-center rounded-2xl border border-white/30 bg-white/90 px-4 py-2 shadow-lg shadow-brand-primary/20'>
              <Image
                src='/images/fldp_final_color.png'
                alt='FLDP Logo'
                width={220}
                height={60}
                className='h-14 w-auto'
                priority
              />
            </div>
          </Link>
          <span className='hidden text-sm font-semibold uppercase tracking-[0.3em] text-white/70 lg:inline'>
            The Atlas
          </span>
        </div>

        {/* Mobile menu button */}
        <div className='flex lg:hidden'>
          <button
            type='button'
            className='inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 p-2.5 text-white transition hover:bg-white/20'
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className='sr-only'>Open main menu</span>
            {mobileMenuOpen ? (
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
            ) : (
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
            )}
          </button>
        </div>

        {/* Desktop navigation */}
        <div className='hidden lg:flex lg:items-center lg:gap-x-4'>
          <div className='flex items-center gap-2 rounded-full border border-white/20 bg-white/10 p-1 shadow-lg shadow-brand-primary/20 backdrop-blur'>
            {navigation.map(item => {
              const isActive = router.pathname.startsWith(item.href)

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group relative rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-white text-brand-primary'
                      : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  <span className='flex items-center gap-2'>
                    {item.name}
                    {isActive && (
                      <span className='h-1 w-1 rounded-full bg-brand-primary' />
                    )}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>

        {/* User actions */}
        <div className='hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4'>
          {isAuthenticated ? (
            <>
              <div className='flex items-center gap-x-3 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-white shadow-lg shadow-brand-primary/20 backdrop-blur'>
                <div className='flex h-9 w-9 items-center justify-center rounded-full bg-white text-brand-primary font-semibold text-sm shadow-inner'>
                  {initials}
                </div>
                <div className='flex flex-col leading-tight'>
                  <span className='font-semibold text-white'>
                    {displayName}
                  </span>
                  <span className='text-xs text-white/60'>{user?.email}</span>
                </div>
              </div>
              <Button
                onClick={handleSignOut}
                size='sm'
                className='rounded-full bg-white/90 px-5 text-brand-primary transition hover:bg-white'
              >
                Sign out
              </Button>
            </>
          ) : (
            <div className='flex items-center gap-2'>
              <Link href='/auth/login'>
                <Button
                  variant='ghost'
                  size='sm'
                  className='rounded-full border border-white/30 bg-white/10 px-5 text-white transition hover:bg-white/20'
                >
                  Log in
                </Button>
              </Link>
              <Link href='/auth/signup'>
                <Button
                  size='sm'
                  className='rounded-full bg-white px-5 text-brand-primary shadow-lg shadow-brand-primary/20 hover:bg-white'
                >
                  Sign up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className='relative border-t border-white/20 bg-white/10 backdrop-blur-lg lg:hidden'>
          <div className='space-y-1 px-6 pb-6 pt-4'>
            {navigation.map(item => (
              <Link
                key={item.name}
                href={item.href}
                className={`block rounded-xl px-4 py-3 text-base font-medium transition-all ${
                  router.pathname.startsWith(item.href)
                    ? 'bg-white text-brand-primary shadow-md'
                    : 'text-white/80 hover:bg-white/10'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            {isAuthenticated && (
              <div className='mt-4 space-y-3 rounded-xl border border-white/20 bg-white/5 p-4 text-white'>
                <div className='flex items-center gap-3'>
                  <div className='flex h-11 w-11 items-center justify-center rounded-full bg-white text-brand-primary font-semibold text-base shadow-inner'>
                    {initials}
                  </div>
                  <div className='flex flex-col'>
                    <span className='font-semibold'>{displayName}</span>
                    <span className='text-sm text-white/70'>{user?.email}</span>
                  </div>
                </div>
                <Button
                  onClick={handleSignOut}
                  variant='ghost'
                  className='w-full rounded-full border border-white/30 bg-white/10 text-white hover:bg-white/20'
                >
                  Sign out
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
