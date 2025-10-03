import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { signIn } from '@/lib/supabase/auth'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

interface FormErrors {
  email?: string
  password?: string
  general?: string
}

export default function LoginPage() {
  const router = useRouter()
  const { isAuthenticated, loading: authLoading } = useAuth()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const redirectTo = (router.query.redirect as string) || '/dashboard'
      router.push(redirectTo)
    }
  }, [isAuthenticated, authLoading, router])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Clear specific field error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const result = await signIn(formData)

      if (result.error) {
        setErrors({ general: result.error })
      } else {
        // Redirect to intended page or dashboard
        const redirectTo = (router.query.redirect as string) || '/dashboard'
        router.push(redirectTo)
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading while checking auth status
  if (authLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Login - The Atlas</title>
        <meta
          name='description'
          content='Sign in to access your Atlas dashboard'
        />
      </Head>

      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4'>
        <Card className='w-full max-w-md'>
          <CardHeader className='space-y-1'>
            <CardTitle className='text-2xl font-bold text-center'>
              Welcome to <span className='text-blue-600'>The Atlas</span>
            </CardTitle>
            <CardDescription className='text-center'>
              Sign in to access your mapping dashboard
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-4'>
              {errors.general && (
                <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm'>
                  {errors.general}
                </div>
              )}

              <div className='space-y-2'>
                <Label htmlFor='email'>Email</Label>
                <Input
                  id='email'
                  name='email'
                  type='email'
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder='Enter your email'
                  className={
                    errors.email ? 'border-red-300 focus:border-red-500' : ''
                  }
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className='text-sm text-red-600'>{errors.email}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='password'>Password</Label>
                <Input
                  id='password'
                  name='password'
                  type='password'
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder='Enter your password'
                  className={
                    errors.password ? 'border-red-300 focus:border-red-500' : ''
                  }
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className='text-sm text-red-600'>{errors.password}</p>
                )}
              </div>

              <Button type='submit' className='w-full' disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className='mt-6 text-center space-y-2'>
              <Link
                href='/auth/forgot-password'
                className='text-sm text-blue-600 hover:text-blue-800 hover:underline'
              >
                Forgot your password?
              </Link>

              <div className='text-sm text-slate-600'>
                Need help?{' '}
                <Link
                  href='/contact'
                  className='text-blue-600 hover:text-blue-800 hover:underline'
                >
                  Contact support
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
