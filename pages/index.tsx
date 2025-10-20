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
    <div className='relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary-light to-brand-accent'>
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.35),_transparent_60%)]' />
      <div className='absolute -right-16 top-20 h-56 w-56 rounded-full bg-white/15 blur-3xl' />
      <div className='absolute bottom-[-20%] left-12 h-64 w-64 rounded-full bg-white/12 blur-3xl' />
      <div className='relative text-center text-white'>
        <div className='mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/30 border-t-transparent'></div>
        <p className='text-sm tracking-wide uppercase text-white/80'>
          {loading
            ? 'Loading your workspace...'
            : 'Redirecting to destination...'}
        </p>
      </div>
    </div>
  )
}

export default Home
