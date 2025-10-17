import { ReactNode } from 'react'
import { Toaster } from '../ui/toaster'
import { Header } from './Header'

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className='min-h-screen flex flex-col bg-slate-50'>
      <Header />
      <main className='flex-1'>{children}</main>
      <Toaster />
    </div>
  )
}
