// Map-related constants and configurations

// Atlas brand colors
export const ATLAS_COLORS = {
  primary: '#0a3d62',
  accent: '#e67e22',
  secondary: '#3498db',
  success: '#00cc66',
  warning: '#ffcc00',
  danger: '#cc0066',
}

// Default map settings
export const DEFAULT_CENTER: [number, number] = [28.5384, -81.3789] // Orlando, FL
export const DEFAULT_ZOOM = 12

// Parcel styling
export const PARCEL_STYLES = {
  default: {
    color: '#3388ff',
    weight: 2,
    fillOpacity: 0.2,
    fillColor: '#3388ff',
  },
  highlighted: {
    color: '#ff7800',
    weight: 3,
    fillOpacity: 0.5,
    fillColor: '#ff7800',
  },
  selected: {
    color: '#e67e22',
    weight: 4,
    fillOpacity: 0.6,
    fillColor: '#e67e22',
  },
}

// Zoning colors
export const ZONING_COLORS = {
  residential: '#ffcc00',
  commercial: '#0066cc',
  industrial: '#cc0066',
  mixed: '#00cc66',
  agricultural: '#66cc00',
  conservation: '#009966',
  public: '#9966cc',
  unknown: '#999999',
}

// Tile layer URLs
export const TILE_LAYERS = {
  PARCELS:
    'https://your-supabase-url/storage/v1/object/public/shared-layers/parcels/{z}/{x}/{y}.png',
  ZONING:
    'https://your-supabase-url/storage/v1/object/public/shared-layers/zoning/{z}/{x}/{y}.png',
}

// Legend configurations
export const LEGEND_ITEMS = {
  ZONING: [
    { color: ZONING_COLORS.residential, label: 'Residential' },
    { color: ZONING_COLORS.commercial, label: 'Commercial' },
    { color: ZONING_COLORS.mixed, label: 'Mixed Use' },
    { color: ZONING_COLORS.industrial, label: 'Industrial' },
    { color: ZONING_COLORS.agricultural, label: 'Agricultural' },
    { color: ZONING_COLORS.conservation, label: 'Conservation' },
  ],
}
