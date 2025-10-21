# Database Setup Guide for The Atlas

## 🚀 Quick Setup Steps

### Step 1: Run the SQL Script

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project: `igpliwujskveyqvgmfpt`
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire contents of `supabase-setup.sql`
6. Paste it into the SQL Editor
7. Click **Run** (or press Cmd+Enter)

### Step 2: Create Storage Buckets

1. In your Supabase Dashboard, go to **Storage** in the left sidebar
2. Click **Create a new bucket**
3. Create these three buckets:

   **Bucket 1: map-data**
   - Name: `map-data`
   - Public bucket: ✅ Yes
   - File size limit: 50MB
   - Allowed MIME types: `application/json, application/geo+json, text/plain`

   **Bucket 2: map-thumbnails**
   - Name: `map-thumbnails`
   - Public bucket: ✅ Yes
   - File size limit: 5MB
   - Allowed MIME types: `image/png, image/jpeg, image/webp`

   **Bucket 3: project-files**
   - Name: `project-files`
   - Public bucket: ❌ No (Private)
   - File size limit: 100MB
   - Allowed MIME types: Leave blank (allow all)

### Step 3: Create Your First Admin User

1. Start your development server: `npm run dev`
2. Go to http://localhost:3000/auth/login
3. If you don't have a sign-up page yet, create a user directly in Supabase:
   - Go to **Authentication** > **Users** in Supabase Dashboard
   - Click **Add user** > **Create new user**
   - Enter your email and password
   - Click **Create user**

4. Make yourself an admin:
   - Go back to **SQL Editor**
   - Run this query (replace with your email):
   ```sql
   UPDATE users
   SET is_admin = TRUE
   WHERE email = 'your-email@example.com';
   ```

### Step 4: Verify Everything Works

Run these verification queries in the SQL Editor:

```sql
-- Check companies
SELECT * FROM companies;

-- Check projects
SELECT * FROM projects;

-- Check project access
SELECT
    c.name as company_name,
    p.name as project_name
FROM project_access pa
JOIN companies c ON c.id = pa.company_id
JOIN projects p ON p.id = pa.project_id;

-- Check maps
SELECT
    p.name as project_name,
    m.name as map_name,
    m.url_slug,
    m.is_active
FROM maps m
JOIN projects p ON p.id = m.project_id
ORDER BY p.name, m.sort_order;

-- Check users
SELECT
    u.email,
    c.name as company_name,
    u.is_admin
FROM users u
LEFT JOIN companies c ON c.id = u.company_id;
```

## 📊 Test Data Created

The script automatically creates:

### Companies (2)

- **Acme Corporation**
- **Global Industries**

### Projects (3)

- **Downtown Development** - Assigned to Acme Corporation
- **Waterfront Project** - Assigned to Acme Corporation
- **Transit Expansion** - Assigned to Global Industries

### Maps (4)

- Downtown Development → Zoning Overview (`/maps/downtown-zoning`)
- Downtown Development → Property Boundaries (`/maps/downtown-properties`)
- Waterfront Project → Coastal Features (`/maps/waterfront-coastal`)
- Transit Expansion → Transit Routes (`/maps/transit-routes`)

## 🔐 Security Features Enabled

✅ Row Level Security (RLS) on all tables
✅ Users can only see their company's data
✅ Admins can manage all data
✅ Project access controlled by company assignment
✅ Automatic user profile creation on sign-up

## 🧪 Testing Access Control

### Test as Regular User

1. Sign up with a test email (not admin)
2. Assign them to a company:
   ```sql
   UPDATE users
   SET company_id = '11111111-1111-1111-1111-111111111111'
   WHERE email = 'testuser@example.com';
   ```
3. They should only see:
   - Their company (Acme Corporation)
   - Projects assigned to Acme (Downtown Development, Waterfront)
   - Maps in those projects only

### Test as Admin

1. Login with your admin account
2. You should have access to:
   - All companies
   - All projects
   - All maps
   - User management (once admin panel is built)

## 🔧 Common Management Tasks

### Assign User to Company

```sql
UPDATE users
SET company_id = (SELECT id FROM companies WHERE name = 'Acme Corporation')
WHERE email = 'user@example.com';
```

### Create New Company

```sql
INSERT INTO companies (name)
VALUES ('New Company Name');
```

### Assign Project to Company

```sql
INSERT INTO project_access (company_id, project_id)
VALUES (
    (SELECT id FROM companies WHERE name = 'Company Name'),
    (SELECT id FROM projects WHERE name = 'Project Name')
);
```

### Add New Map

```sql
INSERT INTO maps (project_id, name, url_slug, description, sort_order)
VALUES (
    (SELECT id FROM projects WHERE name = 'Downtown Development'),
    'Traffic Analysis',
    'downtown-traffic',
    'Traffic flow and congestion data',
    3
);
```

### Make User Admin

```sql
UPDATE users SET is_admin = TRUE WHERE email = 'admin@example.com';
```

### Remove Admin Rights

```sql
UPDATE users SET is_admin = FALSE WHERE email = 'user@example.com';
```

## 📝 Helper Functions Available

The script creates several helpful database functions:

### `is_admin(user_id)`

Check if a user is an admin

```sql
SELECT is_admin('user-uuid-here');
```

### `get_user_projects(user_id)`

Get all projects accessible to a user

```sql
SELECT * FROM get_user_projects('user-uuid-here');
```

### `get_user_maps(user_id)`

Get all maps accessible to a user with project info

```sql
SELECT * FROM get_user_maps('user-uuid-here');
```

## ⚠️ Important Notes

1. **First User**: The first user created won't be auto-assigned to a company. You must manually assign them.

2. **Admin Access**: Make sure to set at least one user as admin before building the admin panel.

3. **Storage Buckets**: The SQL script cannot create storage buckets - you must create these manually in the Supabase Dashboard.

4. **RLS Policies**: All data access is controlled by RLS policies. If users can't see data they should have access to, check the policies.

5. **Test Data**: The test data uses hardcoded UUIDs for easy reference. Feel free to delete and create real data once testing is complete.

## 🎯 Next Steps After Database Setup

1. ✅ Test authentication flow
2. ✅ Verify RLS policies work correctly
3. ⬜ Build admin panel for managing companies/users/projects
4. ⬜ Create first map page using Leaflet
5. ⬜ Build dashboard to display accessible maps
6. ⬜ Implement file upload for GeoJSON data

## 🐛 Troubleshooting

### "relation does not exist" error

- Make sure you're connected to the correct Supabase project
- Verify the SQL script ran completely without errors

### User can't see any data after login

1. Check if user has a company assigned:
   ```sql
   SELECT * FROM users WHERE email = 'their-email@example.com';
   ```
2. Check if their company has project access:
   ```sql
   SELECT * FROM project_access WHERE company_id = 'their-company-id';
   ```

### "permission denied" errors

- Check RLS policies are enabled
- Verify user is authenticated
- For admin operations, ensure user has `is_admin = TRUE`

### Storage upload fails

- Ensure storage buckets are created
- Check bucket permissions (public vs private)
- Verify file size and MIME type restrictions

## 📚 Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [PostgreSQL Functions](https://www.postgresql.org/docs/current/sql-createfunction.html)
