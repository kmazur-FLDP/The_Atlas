import { useAuth } from '@/contexts/AuthContext'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function LogoutPage() {
  const router = useRouter()
  const { signOut } = useAuth()

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await signOut()
        // Redirect to home page after logout
        router.push('/')
      } catch (error) {
        // If logout fails, still redirect to home
        router.push('/')
      }
    }

    handleLogout()
  }, [signOut, router])

  return (
    <>
      <Head>
        <title>Logging out - The Atlas</title>
      </Head>

      <div className='relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary-light to-brand-accent'>
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.35),_transparent_60%)]' />
        <div className='absolute right-16 top-[-10%] h-60 w-60 rounded-full bg-white/15 blur-3xl' />
        <div className='absolute bottom-[-25%] left-[-8%] h-72 w-72 rounded-full bg-white/12 blur-3xl' />
        <div className='relative text-center text-white'>
          <div className='mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/30 border-t-transparent'></div>
          <p className='text-sm tracking-wide uppercase text-white/80'>
            Signing you out...
          </p>
        </div>
      </div>
    </>
  )
}
