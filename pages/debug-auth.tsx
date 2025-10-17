import { useAuth } from '@/contexts/AuthContext'
import { isAdmin as checkIsAdmin, getUserProfile } from '@/lib/supabase/auth'
import { supabase } from '@/lib/supabase/client'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export default function DebugAuth() {
  const router = useRouter()
  const auth = useAuth()
  const [dbCheck, setDbCheck] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkDatabase = async () => {
      if (!auth.user?.id) {
        setLoading(false)
        return
      }

      try {
        // Direct database query
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', auth.user.id)
          .single()

        // Check admin status using the function
        const adminCheck = await checkIsAdmin(auth.user.id)

        // Get user profile
        const profileCheck = await getUserProfile(auth.user.id)

        setDbCheck({
          userData,
          userError,
          adminCheck,
          profileCheck,
        })
      } catch (error) {
        console.error('Error in debug check:', error)
        setDbCheck({ error: String(error) })
      } finally {
        setLoading(false)
      }
    }

    checkDatabase()
  }, [auth.user?.id])

  const handleRefresh = () => {
    auth.refreshProfile()
    window.location.reload()
  }

  const handleSignOut = async () => {
    await auth.signOut()
    router.push('/auth/login')
  }

  return (
    <>
      <Head>
        <title>Auth Debug - The Atlas</title>
      </Head>

      <div className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8'>
        <div className='max-w-4xl mx-auto'>
          <div className='bg-white rounded-lg shadow-lg p-8 mb-6'>
            <h1 className='text-3xl font-bold text-slate-900 mb-6'>
              🔍 Authentication Debug Page
            </h1>

            <div className='space-y-6'>
              {/* Auth Context Status */}
              <div className='border-b pb-4'>
                <h2 className='text-xl font-semibold text-slate-800 mb-3'>
                  Auth Context Status
                </h2>
                <div className='space-y-2 font-mono text-sm'>
                  <div>
                    <span className='text-slate-600'>Loading:</span>{' '}
                    <span
                      className={
                        auth.loading ? 'text-yellow-600' : 'text-green-600'
                      }
                    >
                      {auth.loading ? '⏳ Yes' : '✅ No'}
                    </span>
                  </div>
                  <div>
                    <span className='text-slate-600'>Authenticated:</span>{' '}
                    <span
                      className={
                        auth.isAuthenticated ? 'text-green-600' : 'text-red-600'
                      }
                    >
                      {auth.isAuthenticated ? '✅ Yes' : '❌ No'}
                    </span>
                  </div>
                  <div>
                    <span className='text-slate-600'>Is Admin (Context):</span>{' '}
                    <span
                      className={
                        auth.isAdmin ? 'text-green-600' : 'text-red-600'
                      }
                    >
                      {auth.isAdmin ? '✅ Yes' : '❌ No'}
                    </span>
                  </div>
                  <div>
                    <span className='text-slate-600'>User ID:</span>{' '}
                    <span className='text-blue-600'>
                      {auth.user?.id || 'None'}
                    </span>
                  </div>
                  <div>
                    <span className='text-slate-600'>User Email:</span>{' '}
                    <span className='text-blue-600'>
                      {auth.user?.email || 'None'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Profile Data */}
              <div className='border-b pb-4'>
                <h2 className='text-xl font-semibold text-slate-800 mb-3'>
                  Profile Data (from Context)
                </h2>
                {auth.profile ? (
                  <div className='bg-slate-50 p-4 rounded font-mono text-xs overflow-auto'>
                    <pre>{JSON.stringify(auth.profile, null, 2)}</pre>
                  </div>
                ) : (
                  <div className='text-red-600'>❌ No profile data loaded</div>
                )}
              </div>

              {/* Direct Database Check */}
              <div className='border-b pb-4'>
                <h2 className='text-xl font-semibold text-slate-800 mb-3'>
                  Direct Database Check
                </h2>
                {loading ? (
                  <div className='text-yellow-600'>⏳ Loading...</div>
                ) : dbCheck ? (
                  <div className='space-y-3'>
                    <div>
                      <span className='text-slate-600 font-semibold'>
                        User Data Query Result:
                      </span>
                      {dbCheck.userError ? (
                        <div className='bg-red-50 p-3 rounded mt-2 text-red-800'>
                          ❌ Error: {dbCheck.userError.message}
                        </div>
                      ) : dbCheck.userData ? (
                        <div className='bg-green-50 p-3 rounded mt-2'>
                          <div className='font-mono text-xs'>
                            <pre>
                              {JSON.stringify(dbCheck.userData, null, 2)}
                            </pre>
                          </div>
                        </div>
                      ) : (
                        <div className='bg-red-50 p-3 rounded mt-2 text-red-800'>
                          ❌ No user found in database!
                        </div>
                      )}
                    </div>

                    <div>
                      <span className='text-slate-600 font-semibold'>
                        isAdmin() Function Result:
                      </span>
                      <div
                        className={`p-3 rounded mt-2 ${
                          dbCheck.adminCheck
                            ? 'bg-green-50 text-green-800'
                            : 'bg-red-50 text-red-800'
                        }`}
                      >
                        {dbCheck.adminCheck ? '✅ TRUE' : '❌ FALSE'}
                      </div>
                    </div>

                    <div>
                      <span className='text-slate-600 font-semibold'>
                        getUserProfile() Function Result:
                      </span>
                      {dbCheck.profileCheck ? (
                        <div className='bg-green-50 p-3 rounded mt-2'>
                          <div className='font-mono text-xs'>
                            <pre>
                              {JSON.stringify(dbCheck.profileCheck, null, 2)}
                            </pre>
                          </div>
                        </div>
                      ) : (
                        <div className='bg-red-50 p-3 rounded mt-2 text-red-800'>
                          ❌ No profile returned
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className='text-slate-600'>Not logged in</div>
                )}
              </div>

              {/* Session Data */}
              <div className='border-b pb-4'>
                <h2 className='text-xl font-semibold text-slate-800 mb-3'>
                  Session Data
                </h2>
                {auth.session ? (
                  <div className='bg-slate-50 p-4 rounded font-mono text-xs overflow-auto'>
                    <pre>{JSON.stringify(auth.session, null, 2)}</pre>
                  </div>
                ) : (
                  <div className='text-red-600'>❌ No session</div>
                )}
              </div>

              {/* Actions */}
              <div className='flex gap-4 pt-4'>
                <button
                  onClick={handleRefresh}
                  className='bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors'
                >
                  🔄 Refresh Profile
                </button>
                <button
                  onClick={handleSignOut}
                  className='bg-slate-600 text-white px-6 py-2 rounded-md hover:bg-slate-700 transition-colors'
                >
                  🚪 Sign Out
                </button>
                <Link
                  href='/admin'
                  className='bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors inline-block'
                >
                  🔐 Try Admin Page
                </Link>
              </div>

              {/* Instructions */}
              <div className='bg-blue-50 border border-blue-200 p-4 rounded-lg mt-6'>
                <h3 className='font-semibold text-blue-900 mb-2'>
                  🛠 Troubleshooting Steps:
                </h3>
                <ol className='list-decimal list-inside space-y-2 text-blue-800 text-sm'>
                  <li>
                    Check that{' '}
                    <code className='bg-white px-2 py-1 rounded'>is_admin</code>{' '}
                    is TRUE in the database query above
                  </li>
                  <li>
                    Verify{' '}
                    <code className='bg-white px-2 py-1 rounded'>
                      isAdmin() Function Result
                    </code>{' '}
                    shows TRUE
                  </li>
                  <li>
                    Check{' '}
                    <code className='bg-white px-2 py-1 rounded'>
                      Is Admin (Context)
                    </code>{' '}
                    shows TRUE at the top
                  </li>
                  <li>
                    If database shows TRUE but Context shows FALSE, try clicking
                    &quot;Refresh Profile&quot;
                  </li>
                  <li>If still not working, sign out and sign back in</li>
                  <li>Check browser console (F12) for any error messages</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
