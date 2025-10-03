// Map-related constants and configurations
export const TILE_LAYERS = {
  PARCELS:
    'https://your-supabase-url/storage/v1/object/public/shared-layers/parcels/{z}/{x}/{y}.png',
  ZONING:
    'https://your-supabase-url/storage/v1/object/public/shared-layers/zoning/{z}/{x}/{y}.png',
}

export const DEFAULT_CENTER: [number, number] = [34.0522, -118.2437]
export const DEFAULT_ZOOM = 12

export const MAP_STYLES = {
  SELECTED_PARCEL: {
    color: '#ff7800',
    weight: 3,
    fillOpacity: 0.5,
  },
  DEFAULT_PARCEL: {
    color: '#3388ff',
    weight: 2,
    fillOpacity: 0.2,
  },
}

export const LEGEND_ITEMS = {
  ZONING: [
    { color: '#ffcc00', label: 'Residential' },
    { color: '#0066cc', label: 'Commercial' },
    { color: '#00cc66', label: 'Mixed Use' },
    { color: '#cc0066', label: 'Industrial' },
  ],
}
