import type { NextPage } from 'next'
import Head from 'next/head'

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>The Atlas</title>
        <meta
          name='description'
          content='Mapping platform for geographic data visualization'
        />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100'>
        <div className='container mx-auto px-4 py-16'>
          <div className='text-center'>
            <h1 className='text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl mb-6'>
              Welcome to <span className='text-blue-600'>The Atlas</span>
            </h1>
            <p className='text-xl text-slate-600 mb-8 max-w-2xl mx-auto'>
              A powerful mapping platform providing centralized access to custom
              geographic data visualizations.
            </p>

            <div className='space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center'>
              <a
                href='/auth/login'
                className='inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors'
              >
                Login
              </a>
              <a
                href='/dashboard'
                className='inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-colors'
              >
                View Dashboard
              </a>
            </div>
          </div>

          <div className='mt-16 grid grid-cols-1 md:grid-cols-3 gap-8'>
            <div className='bg-white rounded-lg shadow-md p-6'>
              <h3 className='text-lg font-semibold text-slate-900 mb-2'>
                Custom Maps
              </h3>
              <p className='text-slate-600'>
                Each map is a custom page designed for specific geographic
                analysis needs.
              </p>
            </div>
            <div className='bg-white rounded-lg shadow-md p-6'>
              <h3 className='text-lg font-semibold text-slate-900 mb-2'>
                Project-Based Access
              </h3>
              <p className='text-slate-600'>
                Companies access maps organized by projects relevant to their
                specific needs.
              </p>
            </div>
            <div className='bg-white rounded-lg shadow-md p-6'>
              <h3 className='text-lg font-semibold text-slate-900 mb-2'>
                Secure & Scalable
              </h3>
              <p className='text-slate-600'>
                Built with modern technologies and robust security for
                enterprise use.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Home
