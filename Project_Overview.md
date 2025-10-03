# The Atlas - Developer README

## Project Overview

**The Atlas** is a web-based mapping platform that provides clients with centralized access to custom geographic data visualizations. Clients log in to view maps organized by projects, with each company assigned to specific projects relevant to their needs.

### Key Concepts
- **Companies**: Client organizations that use the platform
- **Projects**: Collections of related maps (e.g., "Downtown Development Project")
- **Maps**: Custom map pages displaying geographic data specific to each project
- **Users**: Belong to a company and can access maps for projects assigned to their company

---

## Tech Stack

### Core Technologies
- **Frontend Framework**: Next.js 14+ with React
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (Authentication, Database, Storage)
- **Mapping Library**: Leaflet with react-leaflet
- **Hosting**: Netlify
- **Language**: JavaScript (TypeScript optional but recommended)

### Why These Choices?
- **Next.js**: File-based routing perfect for custom map pages, excellent Netlify integration
- **Supabase**: Handles auth, database, and file storage in one platform with built-in RLS (Row Level Security)
- **Leaflet**: Open-source, flexible, extensive plugin ecosystem
- **Tailwind**: Rapid UI development with utility-first CSS

---

## Architecture Overview

### Access Control Model (Simple)
1. Users belong to ONE company
2. Companies are assigned to projects
3. Users can access ALL maps within their company's assigned projects
4. Only admins can manage users, companies, projects, and maps

### Map Strategy
- **Each map is a custom page**: Maximum flexibility for unique requirements
- **Shared components**: Reusable building blocks ensure consistent look and feel
- **Central storage**: Shared base layers (tiles) used across multiple maps
- **Client-specific storage**: Project-specific GeoJSON files

---

## Database Schema

```sql
-- Users table
users
- id (uuid, primary key)
- email (text, unique)
- password_hash (text)
- company_id (uuid, foreign key to companies)
- created_at (timestamp)

-- Companies table
companies
- id (uuid, primary key)
- name (text)
- created_at (timestamp)

-- Projects table
projects
- id (uuid, primary key)
- name (text)
- description (text, nullable)
- created_at (timestamp)

-- Project Access (defines company-to-project assignments)
project_access
- id (uuid, primary key)
- project_id (uuid, foreign key to projects)
- company_id (uuid, foreign key to companies)
- created_at (timestamp)

-- Maps table (metadata only, actual map code lives in /pages/maps/)
maps
- id (uuid, primary key)
- project_id (uuid, foreign key to projects)
- name (text)
- url_slug (text, unique) -- must match filename in /pages/maps/
- description (text, nullable)
- thumbnail_url (text, nullable)
- sort_order (integer)
- created_at (timestamp)

-- Uploaded Files (tracks GeoJSON and other files in Supabase Storage)
uploaded_files
- id (uuid, primary key)
- project_id (uuid, foreign key to projects)
- company_id (uuid, foreign key to companies)
- filename (text)
- storage_path (text)
- file_type (text)
- uploaded_by (uuid, foreign key to users)
- created_at (timestamp)
```

### Row Level Security (RLS) Policies
Supabase RLS ensures data security:
- Users can only see companies, projects, and maps they have access to
- Admins bypass RLS for management tasks
- Storage buckets have bucket-level policies for file access

---

## Supabase Storage Structure

```
/shared
  /parcels
    /{z}/{x}/{y}.png (raster tiles for county parcels)
  /zoning
    /{z}/{x}/{y}.png (raster tiles for zoning data)

/clients
  /{company-id}
    /{project-id}
      /data-file-1.geojson
      /data-file-2.geojson
```

### Storage Buckets
- `shared-layers`: Public read access, contains base tile layers
- `client-files`: Private, RLS-controlled access based on company membership

---

## Project Structure

```
/atlas-app
  /pages
    /api
      (optional serverless functions)
    /maps
      /downtown-commercial-analysis.js
      /residential-parcels-westside.js
      /[other-custom-maps].js
    /dashboard
      index.js (client dashboard showing projects & maps)
    /admin
      index.js (admin home)
      users.js (user management)
      companies.js (company management)
      projects.js (project management)
      maps.js (map management)
      uploads.js (file upload interface)
    /auth
      login.js
      logout.js
    index.js (landing/login page)
    
  /components
    /maps
      AtlasMap.jsx (base map component)
      SharedLayers.jsx (reusable layer components)
      MapLegend.jsx
      LayerControl.jsx
      DataPopup.jsx
    /admin
      UserForm.jsx
      CompanySelector.jsx
      ProjectManager.jsx
    /layout
      DashboardLayout.jsx
      AdminLayout.jsx
      Header.jsx
    /ui
      (shadcn/ui components)
      
  /lib
    /supabase
      client.js (Supabase client initialization)
      auth.js (auth helper functions)
    /utils
      mapHelpers.js
      formatters.js
    mapConstants.js (shared map configurations)
    
  /styles
    globals.css (Tailwind imports and global styles)
    
  /public
    /images
      logo.svg
      
  .env.local (environment variables)
  next.config.js
  tailwind.config.js
  package.json
```

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git
- Supabase account (free tier works for development)
- Netlify account

### Initial Setup

1. **Create Next.js App**
```bash
npx create-next-app@latest atlas-app
cd atlas-app
```

2. **Install Dependencies**
```bash
npm install @supabase/supabase-js
npm install leaflet react-leaflet
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npx shadcn-ui@latest init
```

3. **Configure Supabase**
   - Create a new Supabase project
   - Copy your project URL and anon key
   - Create `.env.local`:
   
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. **Initialize Supabase Client**

Create `/lib/supabase/client.js`:
```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

5. **Set Up Database**
   - Run the SQL schema (provided above) in Supabase SQL Editor
   - Configure RLS policies
   - Create storage buckets: `shared-layers`, `client-files`

6. **Configure Tailwind**

Update `tailwind.config.js`:
```javascript
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Add your brand colors here
        primary: '#your-color',
      },
    },
  },
  plugins: [],
}
```

7. **Start Development Server**
```bash
npm run dev
```

Visit `http://localhost:3000`

---

## Development Workflow

### Creating a New Custom Map

1. **Create Map Page File**

Create `/pages/maps/your-map-name.js`:

```javascript
import AtlasMap from '@/components/maps/AtlasMap'
import { CountyParcelLayer, ZoningLayer } from '@/components/maps/SharedLayers'
import MapLegend from '@/components/maps/MapLegend'
import { GeoJSON } from 'react-leaflet'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function YourMapName() {
  const [projectData, setProjectData] = useState(null)
  
  useEffect(() => {
    // Load project-specific GeoJSON
    const loadData = async () => {
      const { data } = await supabase.storage
        .from('client-files')
        .download('company-id/project-id/data.geojson')
      
      const text = await data.text()
      setProjectData(JSON.parse(text))
    }
    
    loadData()
  }, [])

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-slate-800 text-white p-4">
        <h1>Your Map Title</h1>
      </header>
      
      <AtlasMap center={[34.0522, -118.2437]} zoom={14}>
        <CountyParcelLayer />
        <ZoningLayer opacity={0.6} />
        
        {projectData && (
          <GeoJSON 
            data={projectData}
            style={{ color: '#ff7800', weight: 2 }}
          />
        )}
        
        <MapLegend items={[
          { color: '#ff7800', label: 'Project Sites' },
          { color: '#blue', label: 'Zoning' }
        ]} />
      </AtlasMap>
    </div>
  )
}
```

2. **Register Map in Database**

Via admin UI or SQL:
```sql
INSERT INTO maps (project_id, name, url_slug, description, sort_order)
VALUES (
  'project-uuid',
  'Your Map Title',
  'your-map-name', -- MUST match filename
  'Description of what this map shows',
  1
);
```

3. **Test Locally**
   - Visit `http://localhost:3000/maps/your-map-name`
   - Verify all layers load correctly
   - Test interactions

4. **Deploy**
   - Push to Git
   - Netlify auto-deploys
   - Verify in production

---

## Core Components Reference

### AtlasMap (Base Map Component)

```javascript
import AtlasMap from '@/components/maps/AtlasMap'

<AtlasMap 
  center={[lat, lon]}
  zoom={12}
  minZoom={8}
  maxZoom={18}
  showZoomControls={true}
  showScaleBar={true}
>
  {/* Child components: layers, legends, tools */}
</AtlasMap>
```

**Props:**
- `center`: `[latitude, longitude]` array
- `zoom`: Initial zoom level (0-18)
- `minZoom`: Minimum allowed zoom
- `maxZoom`: Maximum allowed zoom
- `showZoomControls`: Boolean, show +/- buttons
- `showScaleBar`: Boolean, show scale indicator
- `children`: React nodes (layers, controls, etc.)

### SharedLayers

```javascript
import { CountyParcelLayer, ZoningLayer } from '@/components/maps/SharedLayers'

<CountyParcelLayer opacity={1.0} />
<ZoningLayer opacity={0.6} />
```

**Available Layers:**
- `CountyParcelLayer`: Raster tiles for county parcels
- `ZoningLayer`: Raster tiles for zoning data

**Props:**
- `opacity`: Number between 0 and 1

### MapLegend

```javascript
import MapLegend from '@/components/maps/MapLegend'

<MapLegend 
  items={[
    { color: '#ff0000', label: 'High Priority' },
    { color: '#00ff00', label: 'Medium Priority' },
    { color: '#0000ff', label: 'Low Priority' }
  ]}
  position="topright"
  title="Legend"
/>
```

**Props:**
- `items`: Array of `{ color, label }` objects
- `position`: `'topleft' | 'topright' | 'bottomleft' | 'bottomright'`
- `title`: Optional legend title

### LayerControl

```javascript
import LayerControl from '@/components/maps/LayerControl'

<LayerControl
  layers={[
    { id: 'parcels', name: 'Parcels', visible: true },
    { id: 'zoning', name: 'Zoning', visible: false }
  ]}
  onToggle={(layerId, visible) => {
    // Handle layer visibility change
  }}
/>
```

---

## Map Constants & Shared Config

Use `/lib/mapConstants.js` for commonly used values:

```javascript
// lib/mapConstants.js
export const TILE_LAYERS = {
  PARCELS: 'https://your-supabase-url/storage/v1/object/public/shared-layers/parcels/{z}/{x}/{y}.png',
  ZONING: 'https://your-supabase-url/storage/v1/object/public/shared-layers/zoning/{z}/{x}/{y}.png'
}

export const DEFAULT_CENTER = [34.0522, -118.2437]
export const DEFAULT_ZOOM = 12

export const MAP_STYLES = {
  SELECTED_PARCEL: {
    color: '#ff7800',
    weight: 3,
    fillOpacity: 0.5
  },
  DEFAULT_PARCEL: {
    color: '#3388ff',
    weight: 2,
    fillOpacity: 0.2
  }
}

export const LEGEND_ITEMS = {
  ZONING: [
    { color: '#ffcc00', label: 'Residential' },
    { color: '#0066cc', label: 'Commercial' },
    { color: '#00cc66', label: 'Mixed Use' },
    { color: '#cc0066', label: 'Industrial' }
  ]
}
```

Import and use:
```javascript
import { TILE_LAYERS, MAP_STYLES, DEFAULT_CENTER } from '@/lib/mapConstants'
```

---

## Authentication Flow

### Login Page (`/pages/auth/login.js`)

```javascript
import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/router'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      alert('Login failed: ' + error.message)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <form onSubmit={handleLogin}>
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Login</button>
    </form>
  )
}
```

### Protected Routes

Wrap pages that require authentication:

```javascript
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase/client'

export default function ProtectedPage() {
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth/login')
      }
    }
    
    checkUser()
  }, [router])

  return <div>Protected content</div>
}
```

---

## Admin Panel Features

### User Management (`/pages/admin/users.js`)
- List all users
- Create new users (email/password)
- Assign users to companies
- Delete users

### Company Management (`/pages/admin/companies.js`)
- List all companies
- Create new companies
- Edit company details
- View which projects a company has access to

### Project Management (`/pages/admin/projects.js`)
- List all projects
- Create new projects
- Assign companies to projects
- View maps within a project

### Map Management (`/pages/admin/maps.js`)
- List all maps grouped by project
- Create map entries (name, url_slug, description)
- Upload thumbnail images
- Set display order
- **Note**: Actual map code must be created in `/pages/maps/` separately

### File Upload (`/pages/admin/uploads.js`)
- Upload GeoJSON files to Supabase Storage
- Select target company and project
- Files stored at: `/clients/{company-id}/{project-id}/{filename}`
- Track uploads in `uploaded_files` table

---

## Client Dashboard (`/pages/dashboard/index.js`)

### Features
- Display all projects the user's company has access to
- Within each project, show all associated maps
- Click a map to navigate to the custom map page
- Clean, card-based UI showing:
  - Project name and description
  - Map thumbnails
  - Map names and descriptions

### Data Flow
1. Get current user's session
2. Query user's `company_id`
3. Query `project_access` to find projects for that company
4. For each project, query `maps` table
5. Display in organized grid

---

## Styling Guidelines

### Tailwind Usage
- Use utility classes for rapid development
- Extract repeated patterns into components
- Follow mobile-first responsive design

### Consistent Design Patterns
- **Headers**: `bg-slate-800 text-white p-4`
- **Cards**: `bg-white rounded-lg shadow-md p-6`
- **Buttons**: Use shadcn/ui Button component
- **Forms**: Use shadcn/ui Form components
- **Tables**: Use shadcn/ui Table component

### Map Styling
- Keep map controls consistent (position, size, color)
- Use the same legend format across all maps
- Maintain consistent popup styling
- Standard zoom controls position: bottom-right

---

## Working with Leaflet & React

### Important: SSR Issues
Leaflet doesn't work with server-side rendering. Use dynamic imports:

```javascript
import dynamic from 'next/dynamic'

const MapComponent = dynamic(() => import('@/components/maps/YourMap'), {
  ssr: false,
  loading: () => <div>Loading map...</div>
})
```

### Common Leaflet Patterns

**Adding Tile Layer:**
```javascript
import { TileLayer } from 'react-leaflet'

<TileLayer
  url="https://your-url/{z}/{x}/{y}.png"
  attribution="Your attribution"
  maxZoom={18}
/>
```

**Adding GeoJSON:**
```javascript
import { GeoJSON } from 'react-leaflet'

<GeoJSON
  data={yourGeoJsonData}
  style={{ color: '#ff7800', weight: 2 }}
  onEachFeature={(feature, layer) => {
    layer.bindPopup(`<strong>${feature.properties.name}</strong>`)
    layer.on('click', () => handleFeatureClick(feature))
  }}
/>
```

**Custom Markers:**
```javascript
import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

const customIcon = L.icon({
  iconUrl: '/images/marker.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
})

<Marker position={[lat, lon]} icon={customIcon}>
  <Popup>Custom marker content</Popup>
</Marker>
```

---

## Deployment

### Netlify Configuration

Create `netlify.toml` in project root:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NEXT_PUBLIC_SUPABASE_URL = "your-supabase-url"
  NEXT_PUBLIC_SUPABASE_ANON_KEY = "your-anon-key"
```

### Environment Variables
Set in Netlify dashboard under Site Settings > Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Deployment Process
1. Push to main branch in Git
2. Netlify automatically builds and deploys
3. Preview deployments available for all branches
4. Production URL: `https://your-site.netlify.app`

### Continuous Deployment
- **Main branch** → Production
- **Develop branch** → Staging (use Netlify branch deploys)
- **Feature branches** → Preview deploys

---

## Best Practices

### Code Organization
- Keep map components small and focused
- Extract reusable logic into custom hooks
- Use consistent naming conventions
- Comment complex map interactions

### Performance
- Lazy load map components to avoid SSR issues
- Use proper zoom levels for tile layers to avoid loading too much data
- Implement loading states for async data
- Consider pagination for large datasets

### Security
- Never expose Supabase service key in frontend code
- Use RLS policies for all sensitive data
- Validate all user inputs in admin panel
- Implement proper session management

### Git Workflow
- Create feature branches for new maps/features
- Write descriptive commit messages
- Review code before merging to main
- Tag releases for production deployments

### Testing Checklist (for each new map)
- [ ] Map loads at correct center and zoom
- [ ] All layers display properly
- [ ] Legend is accurate and positioned correctly
- [ ] Click interactions work as expected
- [ ] Mobile responsive (test on small screens)
- [ ] Loading states display properly
- [ ] Error handling for failed data loads
- [ ] Database entry created with correct url_slug

---

## Common Issues & Solutions

### Issue: Map not loading / blank screen
**Solution**: Check browser console for errors. Common causes:
- Leaflet CSS not imported
- Component not dynamically imported (SSR issue)
- Invalid center coordinates
- Missing tile URL or incorrect path

### Issue: Tiles not displaying
**Solution**: 
- Verify tile URLs in browser network tab
- Check Supabase Storage bucket permissions
- Ensure tiles exist at specified paths
- Verify zoom level is within tile range

### Issue: GeoJSON not showing
**Solution**:
- Validate GeoJSON format (use geojson.io)
- Check coordinate system (must be WGS84, EPSG:4326)
- Verify data is loaded (console.log the data)
- Check style properties aren't making it invisible

### Issue: Authentication redirect loop
**Solution**:
- Clear browser cookies and local storage
- Check Supabase auth configuration
- Verify redirect URLs in Supabase dashboard
- Check for conflicting useEffect hooks

### Issue: RLS blocking data access
**Solution**:
- Review RLS policies in Supabase
- Test queries in Supabase SQL editor
- Verify user's company_id matches expected data
- Check if user session is valid

---

## Phase 2 Features (Future)

These features are planned but not part of MVP:

### Parcel Favorites System
- Users can "favorite" parcels on maps
- Favorites stored in database with company visibility
- Admin dashboard shows all favorited parcels
- Use favorites to inform new custom map creation

**Database Schema Addition:**
```sql
favorite_parcels
- id (uuid, primary key)
- user_id (uuid, foreign key to users)
- company_id (uuid, foreign key to companies)
- map_id (uuid, foreign key to maps)
- parcel_id (text, varies by county)
- geometry (geometry, optional - store parcel shape)
- notes (text, nullable)
- created_at (timestamp)
```

### Additional Future Features
- User-facing file upload (currently admin-only)
- Email notifications for new maps
- Map usage analytics
- Advanced layer filtering
- Drawing/measurement tools
- Print/export functionality
- Dark mode for maps
- Multi-language support

---

## Resources & Documentation

### Official Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Leaflet Docs](https://leafletjs.com/reference.html)
- [React-Leaflet Docs](https://react-leaflet.js.org/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com/)

### Helpful Tutorials
- [Next.js + Supabase Auth Tutorial](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Leaflet GeoJSON Tutorial](https://leafletjs.com/examples/geojson/)
- [Tailwind + Next.js Setup](https://tailwindcss.com/docs/guides/nextjs)

### Tools
- [GeoJSON.io](https://geojson.io) - Validate and visualize GeoJSON
- [Mapshaper](https://mapshaper.org/) - Simplify/convert geodata
- [ColorBrewer](https://colorbrewer2.org/) - Map color schemes
- [Leaflet Plugins](https://leafletjs.com/plugins.html) - Extended functionality

---

## Support & Questions

For questions or issues during development:
1. Check this README first
2. Review official documentation
3. Search existing issues in project repo
4. Ask in team communication channel
5. Create detailed issue in project management system

---

## Getting Help

### When stuck on a map issue:
1. Verify data is loading (console.log)
2. Check browser console for errors
3. Test with simplified version (remove layers one by one)
4. Compare with working map example
5. Check Leaflet/React-Leaflet documentation

### When stuck on Supabase issue:
1. Test query in Supabase SQL editor
2. Check RLS policies
3. Verify user session is valid
4. Review Supabase logs in dashboard
5. Check Supabase community forums

---

## Project Timeline & Milestones

### MVP (Phase 1)
**Goal**: Core platform with custom maps, authentication, and admin panel

**Key Deliverables**:
- [ ] Authentication system (login/logout)
- [ ] User, company, project, map management (admin panel)
- [ ] Client dashboard
- [ ] 3-5 initial custom map pages
- [ ] File upload system
- [ ] Deployment to production

**Estimated Timeline**: 6-8 weeks

### Phase 2
**Goal**: Enhanced features and user interactivity

**Key Deliverables**:
- [ ] Parcel favorites system
- [ ] Admin favorites dashboard
- [ ] Additional map tools (measurement, drawing)
- [ ] Enhanced analytics

**Estimated Timeline**: 4-6 weeks after MVP launch

---

## Version Control

### Branch Strategy
- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - Individual feature branches
- `hotfix/*` - Emergency fixes for production

### Commit Message Format
```
type: Brief description

Longer explanation if needed

Examples:
feat: Add downtown commercial analysis map
fix: Resolve tile loading issue on zoning layer
docs: Update README with new component
style: Format admin panel components
refactor: Extract map legend into reusable component
```

---

## Quick Reference Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Supabase (if using local development)
npx supabase start       # Start local Supabase
npx supabase stop        # Stop local Supabase
npx supabase db reset    # Reset local database

# Deployment
git push origin main     # Trigger Netlify deployment
```

---

## Contact & Maintainers

**Project Owner**: [Your Name]
**Repository**: [Git Repository URL]
**Production URL**: [https://your-atlas.netlify.app]
**Supabase Project**: [Project Name]

---

**Last Updated**: October 2025
**README Version**: 1.0.0