interface LegendItem {
  color: string
  label: string
  pattern?: 'solid' | 'striped' | 'dotted'
}

interface MapLegendProps {
  title: string
  items: LegendItem[]
  position?: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left'
}

export function MapLegend({
  title,
  items,
  position = 'bottom-right',
}: MapLegendProps) {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-left': 'top-4 left-4',
  }

  return (
    <div
      className={`absolute ${positionClasses[position]} z-[1000] bg-white rounded-2xl shadow-lg p-4 max-w-xs`}
    >
      <h3 className='mb-2 text-sm font-bold text-slate-800'>{title}</h3>
      <div className='space-y-2'>
        {items.map((item, idx) => (
          <div key={idx} className='flex items-center gap-2'>
            <div
              className='w-4 h-4 border border-slate-300 rounded'
              style={{ backgroundColor: item.color }}
            />
            <span className='text-xs text-slate-700'>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
