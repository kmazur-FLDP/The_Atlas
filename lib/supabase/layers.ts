import type { MapLayer, MapLayerDetailed, SharedLayer } from '@/types'
import { supabase } from './client'

// ============================================
// SHARED LAYERS
// ============================================

/**
 * Get all shared layers (admin/user view)
 */
export async function getAllSharedLayers(): Promise<SharedLayer[]> {
  try {
    const { data, error } = await supabase
      .from('shared_layers')
      .select('*')
      .order('name')

    if (error) throw error
    return data || []
  } catch (error) {
    return []
  }
}

/**
 * Get shared layers by type
 */
export async function getSharedLayersByType(
  layerType: string
): Promise<SharedLayer[]> {
  try {
    const { data, error } = await supabase
      .from('shared_layers')
      .select('*')
      .eq('layer_type', layerType)
      .order('name')

    if (error) throw error
    return data || []
  } catch (error) {
    return []
  }
}

/**
 * Get a single shared layer by ID
 */
export async function getSharedLayerById(
  id: string
): Promise<SharedLayer | null> {
  try {
    const { data, error } = await supabase
      .from('shared_layers')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    return null
  }
}

export interface CreateSharedLayerInput {
  name: string
  description?: string
  layer_source_type: 'file' | 'url'
  // For file-based layers
  file_path?: string
  file_size?: number
  feature_count?: number
  // For URL-based tile layers
  tile_url?: string
  tile_layer_type?: 'xyz' | 'wms' | 'wmts' | 'vector'
  // Common
  layer_type?: string
}

/**
 * Create a new shared layer (admin only)
 */
export async function createSharedLayer(
  input: CreateSharedLayerInput
): Promise<{ data: SharedLayer | null; error: string | null }> {
  try {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('shared_layers')
      .insert([
        {
          ...input,
          created_by: userData.user.id,
        },
      ])
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error) {
    return {
      data: null,
      error: 'An unexpected error occurred while creating the shared layer',
    }
  }
}

export interface UpdateSharedLayerInput {
  name?: string
  description?: string
  layer_type?: string
  feature_count?: number
  // Allow updating URL for URL-based layers
  tile_url?: string
  tile_layer_type?: 'xyz' | 'wms' | 'wmts' | 'vector'
}

/**
 * Update a shared layer (admin only)
 */
export async function updateSharedLayer(
  id: string,
  input: UpdateSharedLayerInput
): Promise<{ data: SharedLayer | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('shared_layers')
      .update(input)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error) {
    return {
      data: null,
      error: 'An unexpected error occurred while updating the shared layer',
    }
  }
}

/**
 * Delete a shared layer (admin only)
 */
export async function deleteSharedLayer(
  id: string
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.from('shared_layers').delete().eq('id', id)

    if (error) {
      return { error: error.message }
    }

    return { error: null }
  } catch (error) {
    return {
      error: 'An unexpected error occurred while deleting the shared layer',
    }
  }
}

// ============================================
// MAP LAYERS (Associations)
// ============================================

/**
 * Get all layers for a specific map
 */
export async function getMapLayers(mapId: string): Promise<MapLayerDetailed[]> {
  try {
    const { data, error } = await supabase
      .from('map_layers_detailed')
      .select('*')
      .eq('map_id', mapId)
      .order('sort_order')

    if (error) throw error
    return (data || []) as MapLayerDetailed[]
  } catch (error) {
    return []
  }
}

/**
 * Get layer by ID
 */
export async function getMapLayerById(id: string): Promise<MapLayer | null> {
  try {
    const { data, error } = await supabase
      .from('map_layers')
      .select(
        `
        *,
        shared_layer:shared_layers(*)
      `
      )
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    return null
  }
}

export interface CreateMapLayerInput {
  map_id: string
  shared_layer_id?: string
  custom_file_path?: string
  display_label: string
  layer_type?: string
  is_visible?: boolean
  sort_order?: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  style_overrides?: Record<string, any>
}

/**
 * Add a layer to a map
 */
export async function createMapLayer(
  input: CreateMapLayerInput
): Promise<{ data: MapLayer | null; error: string | null }> {
  try {
    // Validate that exactly one of shared_layer_id or custom_file_path is provided
    if (
      (!input.shared_layer_id && !input.custom_file_path) ||
      (input.shared_layer_id && input.custom_file_path)
    ) {
      return {
        data: null,
        error:
          'Must provide either shared_layer_id or custom_file_path, but not both',
      }
    }

    const { data, error } = await supabase
      .from('map_layers')
      .insert([
        {
          ...input,
          is_visible: input.is_visible ?? true,
          sort_order: input.sort_order ?? 0,
        },
      ])
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error) {
    return {
      data: null,
      error: 'An unexpected error occurred while adding the layer to the map',
    }
  }
}

/**
 * Add multiple layers to a map at once
 */
export async function createMapLayers(
  inputs: CreateMapLayerInput[]
): Promise<{ data: MapLayer[] | null; error: string | null }> {
  try {
    const validatedInputs = inputs.map(input => ({
      ...input,
      is_visible: input.is_visible ?? true,
      sort_order: input.sort_order ?? 0,
    }))

    const { data, error } = await supabase
      .from('map_layers')
      .insert(validatedInputs)
      .select()

    if (error) {
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error) {
    return {
      data: null,
      error: 'An unexpected error occurred while adding layers to the map',
    }
  }
}

export interface UpdateMapLayerInput {
  display_label?: string
  is_visible?: boolean
  sort_order?: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  style_overrides?: Record<string, any>
}

/**
 * Update a map layer
 */
export async function updateMapLayer(
  id: string,
  input: UpdateMapLayerInput
): Promise<{ data: MapLayer | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('map_layers')
      .update(input)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error) {
    return {
      data: null,
      error: 'An unexpected error occurred while updating the layer',
    }
  }
}

/**
 * Remove a layer from a map
 */
export async function deleteMapLayer(
  id: string
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.from('map_layers').delete().eq('id', id)

    if (error) {
      return { error: error.message }
    }

    return { error: null }
  } catch (error) {
    return {
      error: 'An unexpected error occurred while removing the layer',
    }
  }
}

/**
 * Remove all layers from a map
 */
export async function deleteAllMapLayers(
  mapId: string
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('map_layers')
      .delete()
      .eq('map_id', mapId)

    if (error) {
      return { error: error.message }
    }

    return { error: null }
  } catch (error) {
    return {
      error: 'An unexpected error occurred while removing layers',
    }
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get shared layer usage count (how many maps use this layer)
 */
export async function getSharedLayerUsageCount(
  layerId: string
): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('map_layers')
      .select('*', { count: 'exact', head: true })
      .eq('shared_layer_id', layerId)

    if (error) throw error
    return count || 0
  } catch (error) {
    return 0
  }
}

/**
 * Get maps using a specific shared layer
 */
export async function getMapsUsingSharedLayer(
  layerId: string
): Promise<Array<{ map_id: string; map_name: string }>> {
  try {
    const { data, error } = await supabase
      .from('map_layers')
      .select(
        `
        map_id,
        maps!inner(name)
      `
      )
      .eq('shared_layer_id', layerId)

    if (error) throw error

    return (
      data?.map(item => ({
        map_id: item.map_id,
        map_name: (item.maps as unknown as { name: string }).name,
      })) || []
    )
  } catch (error) {
    return []
  }
}

/**
 * Load GeoJSON data from Supabase Storage
 */
export async function loadLayerGeoJSON(
  filePath: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<{ data: any; error: string | null }> {
  try {
    const { data, error } = await supabase.storage
      .from('project-files')
      .download(filePath)

    if (error) {
      return { data: null, error: error.message }
    }

    const text = await data.text()
    const geojson = JSON.parse(text)

    return { data: geojson, error: null }
  } catch (error) {
    return {
      data: null,
      error: 'Failed to load or parse GeoJSON data',
    }
  }
}
