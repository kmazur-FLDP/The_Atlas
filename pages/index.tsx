import { useAuth } from '@/contexts/AuthContext'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

const Home: NextPage = () => {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  // Redirect based on authentication status
  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        // Authenticated users go directly to dashboard
        router.push('/dashboard')
      } else {
        // Unauthenticated users go to login
        router.push('/auth/login')
      }
    }
  }, [isAuthenticated, loading, router])

  // Show loading while checking auth or redirecting
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100'>
      <div className='text-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
        <p className='text-slate-600'>
          {loading ? 'Loading...' : 'Redirecting...'}
        </p>
      </div>
    </div>
  )
}

export default Home
