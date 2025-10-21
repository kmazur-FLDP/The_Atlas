import { ReactNode } from 'react'

interface InfoPanelProps {
  title?: string
  children: ReactNode
  position?: 'left' | 'right'
  width?: string
}

export function InfoPanel({
  title,
  children,
  position = 'right',
  width = 'w-96',
}: InfoPanelProps) {
  return (
    <div
      className={`absolute ${position === 'left' ? 'left-0' : 'right-0'} top-0 h-full ${width} bg-white shadow-xl z-[1000] overflow-y-auto`}
    >
      {title && (
        <div className='sticky top-0 bg-brand-primary px-6 py-4 text-white'>
          <h2 className='text-xl font-bold'>{title}</h2>
        </div>
      )}
      <div className='p-6'>{children}</div>
    </div>
  )
}
