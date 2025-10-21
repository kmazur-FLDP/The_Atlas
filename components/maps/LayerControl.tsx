import { useState } from 'react'

interface Layer {
  id: string
  name: string
  visible: boolean
}

interface LayerControlProps {
  layers: Layer[]
  onToggle: (layerId: string) => void
  position?: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left'
}

export function LayerControl({
  layers,
  onToggle,
  position = 'top-right',
}: LayerControlProps) {
  const [isOpen, setIsOpen] = useState(true)

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'bottom-right': 'bottom-20 right-4',
    'bottom-left': 'bottom-20 left-4',
    'top-left': 'top-4 left-4',
  }

  return (
    <div
      className={`absolute ${positionClasses[position]} z-[1000] bg-white rounded-2xl shadow-lg overflow-hidden`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50'
      >
        <span>Layers</span>
        <span>{isOpen ? '−' : '+'}</span>
      </button>

      {isOpen && (
        <div className='p-4 space-y-2 border-t border-slate-200'>
          {layers.map(layer => (
            <label
              key={layer.id}
              className='flex items-center gap-2 cursor-pointer'
            >
              <input
                type='checkbox'
                checked={layer.visible}
                onChange={() => onToggle(layer.id)}
                className='border-slate-300 rounded'
              />
              <span className='text-sm text-slate-700'>{layer.name}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
