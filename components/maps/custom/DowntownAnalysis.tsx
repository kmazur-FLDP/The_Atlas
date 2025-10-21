import { AtlasMap } from '@/components/maps/AtlasMap'
import { InfoPanel } from '@/components/maps/InfoPanel'
import { LayerControl } from '@/components/maps/LayerControl'
import { MapLegend } from '@/components/maps/MapLegend'
import { PARCEL_STYLES, ZONING_COLORS } from '@/lib/mapConstants'
import { supabase } from '@/lib/supabase/client'
import type { Map as MapType } from '@/types'
import type { Feature, GeoJsonObject } from 'geojson'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { GeoJSON } from 'react-leaflet'

interface DowntownAnalysisProps {
  mapData: MapType
}

interface ParcelProperties {
  id: string
  parcel_id: string
  owner: string
  area: number
  zoning: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export default function DowntownAnalysis({ mapData }: DowntownAnalysisProps) {
  const router = useRouter()
  const [parcels, setParcels] = useState<GeoJsonObject | null>(null)
  const [zoning, setZoning] = useState<GeoJsonObject | null>(null)
  const [selectedParcel, setSelectedParcel] = useState<ParcelProperties | null>(
    null
  )
  const [layers, setLayers] = useState([
    { id: 'parcels', name: 'Parcels', visible: true },
    { id: 'zoning', name: 'Zoning', visible: true },
  ])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMapData()
  }, [])

  async function loadMapData() {
    setLoading(true)
    try {
      // Load GeoJSON from Supabase Storage
      // Adjust paths based on your storage structure
      const { data: parcelData } = await supabase.storage
        .from('map-data')
        .download('downtown/parcels.geojson')

      const { data: zoningData } = await supabase.storage
        .from('map-data')
        .download('downtown/zoning.geojson')

      if (parcelData) {
        const parcelText = await parcelData.text()
        setParcels(JSON.parse(parcelText))
      }

      if (zoningData) {
        const zoningText = await zoningData.text()
        setZoning(JSON.parse(zoningText))
      }
    } catch (error) {
      // Error loading data - will show empty map
    } finally {
      setLoading(false)
    }
  }

  function handleLayerToggle(layerId: string) {
    setLayers(prev =>
      prev.map(layer =>
        layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
      )
    )
  }

  function handleParcelClick(feature: Feature) {
    if (feature.properties) {
      setSelectedParcel(feature.properties as ParcelProperties)
    }
  }

  const parcelStyle = (feature?: Feature) => {
    if (
      selectedParcel &&
      feature?.properties &&
      feature.properties.id === selectedParcel.id
    ) {
      return PARCEL_STYLES.selected
    }
    return PARCEL_STYLES.default
  }

  const zoningStyle = (feature?: Feature) => {
    const zoningType = feature?.properties?.zoning_type?.toLowerCase() as
      | keyof typeof ZONING_COLORS
      | undefined
    return {
      fillColor: zoningType ? ZONING_COLORS[zoningType] : ZONING_COLORS.unknown,
      fillOpacity: 0.4,
      color: '#666666',
      weight: 1,
    }
  }

  const isLayerVisible = (id: string) => layers.find(l => l.id === id)?.visible

  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <div className='text-center'>
          <div className='w-12 h-12 mx-auto mb-4 border-4 border-t-4 rounded-full animate-spin border-brand-primary border-t-transparent'></div>
          <p className='text-slate-600'>Loading map data...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{mapData.name} - The Atlas</title>
        <meta name='description' content={mapData.description || ''} />
        <link
          rel='stylesheet'
          href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
          integrity='sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
          crossOrigin=''
        />
      </Head>

      {/* Header bar */}
      <div className='fixed top-0 left-0 right-0 z-[2000] flex items-center justify-between px-6 py-4 shadow-md bg-brand-primary'>
        <div className='flex items-center gap-4'>
          <button
            onClick={() => router.push('/maps')}
            className='p-2 text-white transition-colors rounded-xl hover:bg-white/10'
          >
            <svg
              className='w-5 h-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M10 19l-7-7m0 0l7-7m-7 7h18'
              />
            </svg>
          </button>
          <div>
            <h1 className='text-lg font-bold text-white'>{mapData.name}</h1>
            {mapData.description && (
              <p className='text-sm text-white/80'>{mapData.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Map container with top offset for header */}
      <div className='pt-[72px] h-screen'>
        <AtlasMap center={[28.5384, -81.3789]} zoom={14}>
          {/* Render layers based on visibility */}
          {parcels && isLayerVisible('parcels') && (
            <GeoJSON
              data={parcels}
              style={parcelStyle}
              onEachFeature={(feature, layer) => {
                layer.on('click', () => handleParcelClick(feature))
              }}
            />
          )}

          {zoning && isLayerVisible('zoning') && (
            <GeoJSON data={zoning} style={zoningStyle} />
          )}

          {/* Map controls */}
          <LayerControl
            layers={layers}
            onToggle={handleLayerToggle}
            position='top-right'
          />

          <MapLegend
            title='Zoning Districts'
            items={[
              { color: ZONING_COLORS.residential, label: 'Residential' },
              { color: ZONING_COLORS.commercial, label: 'Commercial' },
              { color: ZONING_COLORS.mixed, label: 'Mixed Use' },
              { color: ZONING_COLORS.industrial, label: 'Industrial' },
              { color: ZONING_COLORS.agricultural, label: 'Agricultural' },
              { color: ZONING_COLORS.conservation, label: 'Conservation' },
            ]}
            position='bottom-right'
          />

          {/* Information panel */}
          <InfoPanel title='Downtown Analysis' position='right' width='w-80'>
            {selectedParcel ? (
              <div className='space-y-4'>
                <h3 className='text-lg font-bold'>Parcel Details</h3>
                <div className='space-y-2'>
                  <div>
                    <span className='font-medium'>Parcel ID:</span>
                    <p className='text-slate-600'>{selectedParcel.parcel_id}</p>
                  </div>
                  <div>
                    <span className='font-medium'>Owner:</span>
                    <p className='text-slate-600'>{selectedParcel.owner}</p>
                  </div>
                  <div>
                    <span className='font-medium'>Area:</span>
                    <p className='text-slate-600'>
                      {selectedParcel.area} acres
                    </p>
                  </div>
                  <div>
                    <span className='font-medium'>Zoning:</span>
                    <p className='text-slate-600'>{selectedParcel.zoning}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className='text-slate-600'>
                <p>Click on a parcel to view details</p>
                {parcels &&
                  'features' in parcels &&
                  Array.isArray(parcels.features) && (
                    <div className='p-4 mt-4 rounded-lg bg-slate-50'>
                      <h4 className='mb-2 font-medium'>Summary Statistics</h4>
                      <p className='text-sm'>
                        Total Parcels: {parcels.features.length || 0}
                      </p>
                    </div>
                  )}
              </div>
            )}
          </InfoPanel>
        </AtlasMap>
      </div>
    </>
  )
}
