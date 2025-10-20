import { ReactNode } from 'react'
import { Toaster } from '../ui/toaster'
import { Header } from './Header'

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className='relative flex min-h-screen flex-col overflow-hidden'>
      <div className='pointer-events-none absolute inset-0 opacity-70'>
        <div className='absolute -left-40 top-32 h-72 w-72 rounded-full bg-brand-primary/15 blur-3xl' />
        <div className='absolute right-[-10%] top-20 h-80 w-80 rounded-full bg-brand-accent/20 blur-3xl' />
        <div className='absolute bottom-[-20%] left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-brand-secondary/20 blur-3xl' />
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.6),_transparent_55%)]' />
      </div>

      <Header />

      <main className='relative z-10 flex-1 pb-16'>{children}</main>

      <Toaster />
    </div>
  )
}
