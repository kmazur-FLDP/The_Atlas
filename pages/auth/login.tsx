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
import Image from 'next/image'
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
      <div className='relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary-light to-brand-accent'>
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.38),_transparent_58%)]' />
        <div className='absolute -top-20 right-10 h-72 w-72 rounded-full bg-white/20 blur-3xl' />
        <div className='absolute bottom-[-25%] left-[-10%] h-96 w-96 rounded-full bg-white/10 blur-3xl' />
        <div className='relative animate-spin rounded-full h-8 w-8 border-b-2 border-white'></div>
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

      <div className='relative flex min-h-screen overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary-light to-brand-accent'>
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.38),_transparent_58%)]' />
        <div className='absolute -top-24 right-32 h-96 w-96 rounded-full bg-white/15 blur-3xl' />
        <div className='absolute bottom-[-30%] left-[-12%] h-[28rem] w-[28rem] rounded-full bg-white/12 blur-3xl' />

        <div className='relative z-10 flex w-full flex-col-reverse items-center justify-center gap-12 px-6 py-12 lg:flex-row lg:items-stretch lg:justify-between lg:px-12'>
          <div className='hidden max-w-xl flex-1 flex-col justify-between rounded-4xl border border-white/25 bg-white/10 p-10 text-white backdrop-blur-2xl shadow-[0_45px_90px_rgba(10,61,98,0.35)] lg:flex'>
            <div className='space-y-8'>
              <div className='inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.4em]'>
                FLDP Atlas
              </div>
              <h2 className='text-4xl font-semibold leading-tight'>
                Spatial intelligence crafted for forward-thinking teams.
              </h2>
              <p className='text-base text-white/80'>
                Log in to synchronize your organization, deliver bespoke mapping
                experiences, and surface insights your clients can act on
                instantly.
              </p>
            </div>
            <div className='grid gap-4 text-sm text-white/70'>
              <div className='flex items-center gap-3 rounded-3xl border border-white/20 bg-white/10 px-5 py-4'>
                <span className='inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white'>
                  <svg
                    className='h-4 w-4'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M5 13l4 4L19 7'
                    />
                  </svg>
                </span>
                Enterprise-grade security powered by Supabase
              </div>
              <div className='flex items-center gap-3 rounded-3xl border border-white/20 bg-white/10 px-5 py-4'>
                <span className='inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white'>
                  <svg
                    className='h-4 w-4'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 8c1.657 0 3-.895 3-2s-1.343-2-3-2-3 .895-3 2 1.343 2 3 2zM5.5 21a4.5 4.5 0 019 0m4.5-11v2m0 4h.01M4 13h4l4-8 4 16 4-8h4'
                    />
                  </svg>
                </span>
                Ultra-modern spatial dashboards designed for clarity
              </div>
            </div>
          </div>

          <Card className='glass-panel relative z-10 w-full max-w-lg overflow-hidden rounded-4xl border border-white/40 shadow-[0_35px_65px_rgba(10,61,98,0.22)] lg:max-w-md'>
            <CardHeader className='space-y-6 pb-2 text-center'>
              <div className='mx-auto flex items-center justify-center'>
                <Image
                  src='/images/fldp_final_color.png'
                  alt='FLDP Logo'
                  width={240}
                  height={72}
                  className='h-16 w-auto drop-shadow-xl'
                  priority
                />
              </div>
              <div className='space-y-2'>
                <CardTitle className='text-3xl font-semibold text-slate-900'>
                  Sign in to your workspace
                </CardTitle>
                <CardDescription className='text-base text-slate-600'>
                  Enter your credentials to access the FLDP Atlas control
                  center.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className='space-y-5 pb-8'>
              <form onSubmit={handleSubmit} className='space-y-5'>
                {errors.general && (
                  <div className='rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-700 shadow-sm'>
                    {errors.general}
                  </div>
                )}

                <div className='space-y-2'>
                  <Label
                    htmlFor='email'
                    className='text-sm font-medium text-slate-700'
                  >
                    Email
                  </Label>
                  <Input
                    id='email'
                    name='email'
                    type='email'
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder='you@company.com'
                    className={
                      errors.email
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                        : 'border-slate-200 focus:border-brand-primary focus:ring-brand-primary/30'
                    }
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className='text-sm text-red-600'>{errors.email}</p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label
                    htmlFor='password'
                    className='text-sm font-medium text-slate-700'
                  >
                    Password
                  </Label>
                  <Input
                    id='password'
                    name='password'
                    type='password'
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder='••••••••'
                    className={
                      errors.password
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                        : 'border-slate-200 focus:border-brand-primary focus:ring-brand-primary/30'
                    }
                    disabled={isLoading}
                  />
                  {errors.password && (
                    <p className='text-sm text-red-600'>{errors.password}</p>
                  )}
                </div>

                <Button
                  type='submit'
                  className='w-full rounded-full bg-brand-primary py-3 text-base font-semibold tracking-wide text-white shadow-lg shadow-brand-primary/25 transition hover:bg-brand-primary-dark hover:shadow-xl'
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className='flex items-center justify-center gap-3'>
                      <span className='inline-flex h-5 w-5 animate-spin rounded-full border-2 border-white/60 border-t-transparent'></span>
                      Signing in...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>

              <div className='space-y-3 text-center'>
                <Link
                  href='/auth/forgot-password'
                  className='text-sm font-medium text-brand-primary hover:text-brand-primary-dark'
                >
                  Forgot your password?
                </Link>
                <p className='text-sm text-slate-500'>
                  Need help?{' '}
                  <Link
                    href='/contact'
                    className='font-medium text-brand-accent hover:text-brand-accent-dark'
                  >
                    Contact support
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
