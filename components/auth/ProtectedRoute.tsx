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
  const { isAuthenticated, isAdmin, loading } = useAuth()

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
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-slate-600'>Loading...</p>
        </div>
      </div>
    )
  }

  // Show unauthorized message for admin-only routes
  if (requireAdmin && isAuthenticated && !isAdmin) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100'>
        <div className='text-center max-w-md mx-auto p-6'>
          <div className='bg-red-50 border border-red-200 rounded-lg p-6'>
            <h1 className='text-xl font-semibold text-red-800 mb-2'>
              Access Denied
            </h1>
            <p className='text-red-700 mb-4'>
              You don&apos;t have permission to access this page. Administrator
              privileges are required.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className='bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors'
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Redirect if not authenticated (this will happen via useEffect)
  if (shouldRedirect) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-slate-600'>Redirecting...</p>
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
