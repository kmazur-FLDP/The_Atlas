import 'leaflet/dist/leaflet.css'
import { ReactNode } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'

interface AtlasMapProps {
  center: [number, number]
  zoom: number
  children: ReactNode
  showControls?: boolean
  className?: string
}

export function AtlasMap({
  center,
  zoom,
  children,
  showControls = true,
  className = '',
}: AtlasMapProps) {
  return (
    <div className={`relative w-full h-screen ${className}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        className='w-full h-full'
        zoomControl={showControls}
      >
        <TileLayer
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          attribution='&copy; OpenStreetMap contributors'
        />
        {children}
      </MapContainer>
    </div>
  )
}
