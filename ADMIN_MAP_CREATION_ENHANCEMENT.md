# Enhanced Admin Map Creation - Implementation Summary

## Overview

Enhanced the admin map creation interface to support both iframe embeds and custom interactive React components with data layer uploads - all in a single streamlined workflow.

## What Was Implemented

### 1. **Map Type Selection**

- **Iframe Embed**: Traditional embed of external map URLs
- **Custom Component**: Interactive React-based maps with GeoJSON data layers

### 2. **Enhanced Form** (`/pages/admin/maps/new.tsx`)

#### For All Maps:

- Project selection
- Map name and auto-generated URL slug
- Description
- Sort order

#### For Iframe Maps:

- Iframe URL input field
- Simple one-step creation

#### For Custom Maps:

Three key sections:

**A. Data Layer Upload (Optional)**

- Drag-and-drop or click-to-upload interface
- Supports multiple .geojson files
- Each file gets:
  - Auto-generated display label (editable)
  - File size display
  - Remove button
- Files uploaded to: `map-data/{project-slug}/{filename}.geojson`
- Automatic upload to Supabase Storage during map creation

**B. Component Name**

- PascalCase input (e.g., `DowntownZoning`)
- Validation: must start with letter, only letters/numbers
- Shows where to create component file
- Displays registration code snippet

**C. Next Steps Guide**

- Helpful card showing 4-step process:
  1. Create component file at `components/maps/custom/{ComponentName}.tsx`
  2. Register in `pages/maps/[slug].tsx`
  3. Import map components (AtlasMap, MapLegend, etc.)
  4. Load GeoJSON data from uploaded paths

### 3. **File Upload Features**

**Upload Process:**

```typescript
// Files are uploaded to Supabase Storage
const filePath = `map-data/${projectSlug}/${layer.fileName}`
await supabase.storage.from('project-files').upload(filePath, layer.file)
```

**File Management:**

- Upload multiple GeoJSON files per map
- Edit display labels for each layer
- Remove individual files before submission
- File size validation and display
- Preview list shows all uploaded files

**Storage Structure:**

```
project-files/
  map-data/
    downtown-project/
      parcels.geojson
      zoning.geojson
      wetlands.geojson
    lakefront-development/
      boundaries.geojson
```

### 4. **Visual Improvements**

- **Type Selection Cards**: Visual buttons with icons for iframe vs custom
- **Info Panels**: Blue info boxes explaining data upload paths
- **Warning Panel**: Amber panel reminding about component registration
- **File Upload Zone**: Drag-and-drop area with hover effects
- **File List**: Clean cards showing uploaded files with edit/remove options
- **Code Preview**: Dark-themed code block showing registration snippet

### 5. **User Experience**

**Single-Page Workflow:**

- No need to navigate to separate upload page
- All configuration in one place
- Immediate feedback on file uploads
- Clear instructions for next steps

**Validation:**

- Project required
- Name required
- URL slug format validation
- Iframe URL required for iframe maps
- Component name required + format validation for custom maps
- GeoJSON file type validation

**Success Messages:**

- Iframe maps: "Map created"
- Custom maps: "Map created. X layer(s) uploaded. Register component in [slug].tsx"

## How to Use

### Creating an Iframe Map:

1. Select "Iframe Embed" type
2. Fill in project, name, slug, description
3. Enter iframe URL
4. Click "Create Map"

### Creating a Custom Map:

1. Select "Custom Component" type
2. Fill in basic info (project, name, slug, description)
3. **Upload data layers** (optional):
   - Click upload zone or drag files
   - Edit labels for each file
   - Remove any unwanted files
4. Enter component name (e.g., `LakefrontAnalysis`)
5. Click "Create Map"
6. **After creation:**
   - Create component at `components/maps/custom/LakefrontAnalysis.tsx`
   - Register in `CUSTOM_MAP_COMPONENTS` in `pages/maps/[slug].tsx`
   - Use uploaded data paths in your component

## Technical Details

### Data Layer Upload

- **Validation**: Only `.geojson` files accepted
- **Storage**: Supabase Storage bucket `project-files`
- **Path**: `map-data/{project-slug-from-name}/{filename}`
- **Options**: `cacheControl: 3600`, `upsert: true`

### Project Slug Generation

```typescript
// Projects don't have url_slug in database
// Generate from project name when needed
const generateProjectSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
```

### Component Registration Example

```typescript
// In pages/maps/[slug].tsx
import dynamic from 'next/dynamic'

const CUSTOM_MAP_COMPONENTS: Record<string, any> = {
  'downtown-analysis': dynamic(
    () => import('@/components/maps/custom/DowntownAnalysis'),
    { ssr: false }
  ),
  'lakefront-analysis': dynamic(
    () => import('@/components/maps/custom/LakefrontAnalysis'),
    { ssr: false }
  ),
}
```

### Loading Uploaded Data in Components

```typescript
// In your custom component
const fetchData = async () => {
  const { data } = await supabase.storage
    .from('project-files')
    .download('map-data/downtown-project/parcels.geojson')

  if (data) {
    const text = await data.text()
    const geojson = JSON.parse(text)
    // Use geojson data...
  }
}
```

## Files Modified

1. **`/pages/admin/maps/new.tsx`** (Completely rewritten - 564 lines)
   - Added map type selection UI
   - Added data layer upload interface
   - Added component name input
   - Added next steps guide
   - Integrated Supabase Storage upload

2. **`/pages/maps/[slug].tsx`** (Minor update)
   - Uncommented DowntownAnalysis registration
   - Now actively using the CUSTOM_MAP_COMPONENTS registry

## Benefits

✅ **All-in-one workflow** - No separate upload page needed
✅ **Better UX** - Visual feedback at every step
✅ **Clear instructions** - Admins know exactly what to do next
✅ **Flexible** - Supports both iframe and custom maps
✅ **Scalable** - Easy to add more custom map components
✅ **Storage integrated** - Automatic upload to Supabase
✅ **Data organized** - Files stored per project in logical structure

## Next Steps (Testing - Task #8)

1. **Access Control Testing**
   - Regular user sees only company maps
   - Admin sees all maps
   - Verify project_access junction table filtering

2. **Custom Component Testing**
   - Create new map with data upload
   - Build component file
   - Register in [slug].tsx
   - Verify map loads correctly

3. **Iframe Testing**
   - Create iframe map
   - Verify fallback works when no custom component exists
   - Test with various iframe sources

4. **Mobile Responsive Testing**
   - Upload interface on mobile
   - Map viewing on mobile
   - Component interactions on touch devices

5. **Error Handling**
   - Test with invalid GeoJSON
   - Test with large files
   - Test network failures during upload
   - Test missing Supabase Storage bucket

## Status

✅ **Complete**: Custom maps implementation (7 of 8 tasks done)
⏳ **Remaining**: Testing phase (Task #8)
