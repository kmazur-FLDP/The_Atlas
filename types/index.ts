// Database Types
export interface User {
  id: string
  email: string
  name?: string
  company_id: string
  is_admin: boolean
  created_at: string
  company?: Company
}

export interface Company {
  id: string
  name: string
  created_at: string
  projects?: Project[]
}

export interface Project {
  id: string
  name: string
  description?: string
  created_at: string
  maps?: Map[]
}

export interface Map {
  id: string
  project_id: string
  name: string
  url_slug: string
  description?: string
  thumbnail_url?: string
  sort_order: number
  is_active: boolean
  created_at: string
  project?: Project
}

export interface SharedLayer {
  id: string
  name: string
  description?: string
  layer_source_type: 'file' | 'url'
  file_path?: string // For file-based layers
  tile_url?: string // For URL-based tile layers
  tile_layer_type?: 'xyz' | 'wms' | 'wmts' | 'vector' // Tile format
  layer_type?: string
  file_size?: number
  feature_count?: number
  created_by?: string
  created_at: string
  updated_at: string
}

export interface MapLayer {
  id: string
  map_id: string
  shared_layer_id?: string
  custom_file_path?: string
  display_label: string
  layer_type?: string
  is_visible: boolean
  sort_order: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  style_overrides?: Record<string, any>
  created_at: string
  // Populated from joins
  shared_layer?: SharedLayer
}

export interface MapLayerDetailed extends MapLayer {
  shared_layer_name?: string
  shared_file_path?: string
  shared_description?: string
  effective_file_path: string
  source_type: 'shared' | 'custom'
}

export interface ProjectAccess {
  id: string
  project_id: string
  company_id: string
  created_at: string
  project?: Project
  company?: Company
}

export interface UploadedFile {
  id: string
  project_id: string
  company_id: string
  filename: string
  storage_path: string
  file_type: string
  file_size?: number
  uploaded_by: string
  created_at: string
  project?: Project
  company?: Company
  uploader?: User
}

// Map Component Types
export interface MapCenter {
  lat: number
  lon: number
}

export interface LegendItem {
  color: string
  label: string
}

export interface MapStyle {
  color: string
  weight: number
  fillOpacity?: number
  opacity?: number
}

// Supabase Auth Types
export interface AuthUser {
  id: string
  email?: string
  user_metadata?: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any
  }
}

export interface AuthSession {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  user: AuthUser
}
