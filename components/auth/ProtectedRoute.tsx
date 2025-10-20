import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/router'
import { ReactNode, useEffect } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  requireAdmin?: boolean
  redirectTo?: string
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
  redirectTo = '/auth/login',
}: ProtectedRouteProps) {
  const router = useRouter()
  const { isAuthenticated, isAdmin, loading, user } = useAuth()

  const shouldRedirect =
    !loading && (!isAuthenticated || (requireAdmin && !isAdmin))

  useEffect(() => {
    if (shouldRedirect) {
      const currentPath = router.asPath
      const loginUrl = redirectTo.includes('?')
        ? `${redirectTo}&redirect=${encodeURIComponent(currentPath)}`
        : `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`
      router.push(loginUrl)
    }
  }, [shouldRedirect, router, redirectTo])

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className='relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary-light to-brand-accent'>
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.35),_transparent_60%)]' />
        <div className='absolute -right-20 top-10 h-60 w-60 rounded-full bg-white/15 blur-3xl' />
        <div className='absolute bottom-[-25%] left-10 h-72 w-72 rounded-full bg-white/12 blur-3xl' />
        <div className='relative text-center text-white'>
          <div className='mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/30 border-t-transparent'></div>
          <p className='text-sm tracking-wide uppercase text-white/80'>
            Loading...
          </p>
        </div>
      </div>
    )
  }

  // Show unauthorized message for admin-only routes
  if (requireAdmin && isAuthenticated && !isAdmin) {
    return (
      <div className='relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary-light to-brand-accent'>
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.35),_transparent_60%)]' />
        <div className='absolute right-20 top-[-10%] h-64 w-64 rounded-full bg-white/15 blur-3xl' />
        <div className='absolute bottom-[-25%] left-[-10%] h-80 w-80 rounded-full bg-white/12 blur-3xl' />
        <div className='relative w-full max-w-lg px-6'>
          <div className='rounded-3xl border border-white/30 bg-white/80 p-8 text-center shadow-[0_35px_65px_rgba(10,61,98,0.25)] backdrop-blur-xl'>
            <h1 className='text-2xl font-semibold text-brand-primary mb-3'>
              Access restricted
            </h1>
            <p className='text-sm text-slate-600 mb-4'>
              You need administrator privileges to open this workspace panel.
            </p>
            <div className='text-xs text-slate-500 bg-white/70 border border-white/40 rounded-2xl p-3 mb-6 font-mono'>
              Debug: User ID: {user?.id || 'none'} | Email:{' '}
              {user?.email || 'none'} | isAdmin: {String(isAdmin)}
            </div>
            <div className='grid gap-3'>
              <button
                onClick={() => router.push('/dashboard')}
                className='rounded-full bg-brand-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-primary/30 transition hover:bg-brand-primary-dark'
              >
                Return to dashboard
              </button>
              <button
                onClick={() => router.push('/debug-auth')}
                className='rounded-full border border-brand-accent/40 bg-white px-5 py-3 text-sm font-semibold text-brand-accent transition hover:border-brand-accent hover:bg-brand-accent/10'
              >
                Debug authentication
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Redirect if not authenticated (this will happen via useEffect)
  if (shouldRedirect) {
    return (
      <div className='relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary-light to-brand-accent'>
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.35),_transparent_60%)]' />
        <div className='absolute -right-16 top-24 h-56 w-56 rounded-full bg-white/15 blur-3xl' />
        <div className='absolute bottom-[-22%] left-16 h-64 w-64 rounded-full bg-white/12 blur-3xl' />
        <div className='relative text-center text-white'>
          <div className='mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/30 border-t-transparent'></div>
          <p className='text-sm tracking-wide uppercase text-white/80'>
            Redirecting...
          </p>
        </div>
      </div>
    )
  }

  // Render children if authenticated (and admin if required)
  return <>{children}</>
}

// Higher-order component version
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requireAdmin = false
) {
  const AuthenticatedComponent = (props: P) => (
    <ProtectedRoute requireAdmin={requireAdmin}>
      <Component {...props} />
    </ProtectedRoute>
  )

  AuthenticatedComponent.displayName = `withAuth(${Component.displayName || Component.name})`

  return AuthenticatedComponent
}
