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

      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-slate-600'>Signing you out...</p>
        </div>
      </div>
    </>
  )
}
