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
    <header className='sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80'>
      <nav className='mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8'>
        {/* Logo */}
        <div className='flex lg:flex-1'>
          <Link
            href={isAuthenticated ? '/dashboard' : '/'}
            className='-m-1.5 p-1.5'
          >
            <span className='sr-only'>FLDP Atlas</span>
            <Image
              src='/images/fldp_final_color.png'
              alt='FLDP Logo'
              width={160}
              height={40}
              className='h-10 w-auto'
              priority
            />
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className='flex lg:hidden'>
          <button
            type='button'
            className='-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-slate-700 hover:bg-slate-100'
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
        <div className='hidden lg:flex lg:gap-x-8'>
          {navigation.map(item => (
            <Link
              key={item.name}
              href={item.href}
              className={`text-sm font-semibold leading-6 transition-colors ${
                router.pathname.startsWith(item.href)
                  ? 'text-brand-primary'
                  : 'text-slate-700 hover:text-brand-primary'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* User actions */}
        <div className='hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4'>
          {isAuthenticated ? (
            <>
              <div className='flex items-center gap-x-2 text-sm text-slate-600'>
                <div className='flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary font-semibold text-xs'>
                  {initials}
                </div>
                <span className='hidden xl:inline'>{displayName}</span>
              </div>
              <Button
                onClick={handleSignOut}
                variant='ghost'
                size='sm'
                className='text-slate-700 hover:text-slate-900'
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link href='/auth/login'>
                <Button variant='ghost' size='sm'>
                  Log in
                </Button>
              </Link>
              <Link href='/auth/signup'>
                <Button
                  size='sm'
                  className='bg-brand-primary hover:bg-brand-primary-dark'
                >
                  Sign up
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className='lg:hidden'>
          <div className='space-y-1 border-t border-slate-200 px-6 pb-3 pt-2'>
            {navigation.map(item => (
              <Link
                key={item.name}
                href={item.href}
                className={`block rounded-md px-3 py-2 text-base font-semibold ${
                  router.pathname.startsWith(item.href)
                    ? 'bg-brand-primary/10 text-brand-primary'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            {isAuthenticated && (
              <div className='border-t border-slate-200 pt-3 mt-3'>
                <div className='flex items-center gap-x-3 px-3 py-2 text-sm text-slate-600'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary font-semibold text-sm'>
                    {initials}
                  </div>
                  <div className='flex flex-col'>
                    <span className='font-medium text-slate-900'>
                      {displayName}
                    </span>
                    <span className='text-xs text-slate-500'>
                      {user?.email}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className='w-full text-left px-3 py-2 text-base font-semibold text-slate-700 hover:bg-slate-100 rounded-md'
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
