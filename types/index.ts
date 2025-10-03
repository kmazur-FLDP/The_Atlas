// Database Types
export interface User {
  id: string
  email: string
  company_id: string
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
  created_at: string
  project?: Project
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
