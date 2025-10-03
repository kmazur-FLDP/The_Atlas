# Authentication Setup Instructions

## 🚀 Quick Setup for Testing

### 1. Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 2. Supabase Database Setup

Run this SQL in your Supabase SQL Editor:

```sql
-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;

-- Create tables
CREATE TABLE companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE users (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    company_id UUID REFERENCES companies(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE project_access (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, company_id)
);

CREATE TABLE maps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    url_slug TEXT UNIQUE NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE uploaded_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Row Level Security Policies

```sql
-- Users can only see their own profile and users in their company
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Company access - users can see their own company
CREATE POLICY "Users can view own company" ON companies
    FOR SELECT USING (
        id IN (
            SELECT company_id FROM users WHERE id = auth.uid()
        )
    );

-- Project access through company membership
CREATE POLICY "Users can view accessible projects" ON projects
    FOR SELECT USING (
        id IN (
            SELECT pa.project_id
            FROM project_access pa
            JOIN users u ON u.company_id = pa.company_id
            WHERE u.id = auth.uid()
        )
    );

-- Maps access through project access
CREATE POLICY "Users can view accessible maps" ON maps
    FOR SELECT USING (
        project_id IN (
            SELECT pa.project_id
            FROM project_access pa
            JOIN users u ON u.company_id = pa.company_id
            WHERE u.id = auth.uid()
        )
    );
```

### 4. Test Data (Optional)

```sql
-- Insert test company
INSERT INTO companies (id, name)
VALUES ('123e4567-e89b-12d3-a456-426614174000', 'Test Company');

-- Insert test project
INSERT INTO projects (id, name, description)
VALUES ('123e4567-e89b-12d3-a456-426614174001', 'Downtown Development', 'Urban planning project for downtown area');

-- Connect company to project
INSERT INTO project_access (company_id, project_id)
VALUES ('123e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174001');

-- Insert test map
INSERT INTO maps (project_id, name, url_slug, description)
VALUES ('123e4567-e89b-12d3-a456-426614174001', 'Zoning Overview', 'downtown-zoning', 'Current zoning classifications for downtown area');
```

### 5. User Registration

After a user signs up through the app, manually assign them to a company:

```sql
-- Update user with company assignment (replace with actual user ID)
UPDATE users
SET company_id = '123e4567-e89b-12d3-a456-426614174000'
WHERE email = 'user@example.com';
```

## 🧪 Testing the Auth Flow

1. **Start Development Server**

   ```bash
   npm run dev
   ```

2. **Test Pages**
   - Home: http://localhost:3000
   - Login: http://localhost:3000/auth/login
   - Dashboard: http://localhost:3000/dashboard (requires auth)

3. **Test Authentication**
   - Try accessing dashboard without login (should redirect)
   - Sign up/login with valid credentials
   - Check dashboard shows user info
   - Test logout functionality

## ✅ What's Working

- ✅ User authentication with Supabase
- ✅ Protected routes with automatic redirects
- ✅ Auth context provider for global state
- ✅ Login/logout functionality
- ✅ User profile loading with company info
- ✅ Admin role detection
- ✅ Responsive UI with proper error handling

## 🔧 Admin Configuration

To mark a user as admin, add their email to the `isAdmin` function in `/lib/supabase/auth.ts`:

```typescript
const adminEmails = [
  'admin@yourdomain.com',
  'your-email@example.com', // Add your email here
]
```
