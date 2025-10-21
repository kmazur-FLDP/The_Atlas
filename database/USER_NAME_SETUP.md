# User Name Display Setup

## Overview

The application now displays the user's real name instead of their email in the header and dashboard.

## Database Setup

### Step 1: Add Name Column to Users Table

Run this SQL in your Supabase SQL Editor:

```sql
-- Add name column to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS name TEXT;

-- Add a comment to the column
COMMENT ON COLUMN public.users.name IS 'User full name or display name';
```

### Step 2: Update Your User's Name

You can update user names in the Supabase dashboard or via SQL:

**Option A: Update via Supabase Dashboard**

1. Go to your Supabase project
2. Navigate to Table Editor → users table
3. Find your user record
4. Click to edit and add your name in the `name` column
5. Save

**Option B: Update via SQL**

```sql
-- Update a specific user by email
UPDATE public.users
SET name = 'Kevin Mazur'  -- Replace with actual name
WHERE email = 'kmmazur@fldandp.com';  -- Replace with your email

-- Verify the update
SELECT id, email, name, is_admin
FROM public.users
WHERE email = 'kmmazur@fldandp.com';
```

## How It Works

### Display Logic

1. **Name Display Priority:**
   - If `profile.name` exists → Use the full name
   - If no name → Use email username (part before @)
   - If no email → Use "User"

2. **Avatar Initials:**
   - If name exists → Use first letter of each word (up to 2 letters)
   - If no name → Use first letter of email
   - If no email → Use "U"

### Example:

- **Name**: "Kevin Mazur" → Shows "Kevin Mazur" with initials "KM"
- **Email only**: "kmmazur@fldandp.com" → Shows "kmmazur" with initial "K"
- **No data**: Shows "User" with initial "U"

## Components Updated

### 1. Header Component (`components/layout/Header.tsx`)

- Desktop view: Shows initials in avatar circle + name
- Mobile menu: Shows initials, name, and email (email as subtitle)

### 2. Dashboard (`pages/dashboard/index.tsx`)

- Welcome message: "Welcome back, [Name]!"
- Account card: Shows initials and name instead of email

### 3. Type Definition (`types/index.ts`)

- Added optional `name` field to User interface

## Testing

After adding names to the database:

1. **Refresh the page** - The profile should reload with the new name
2. **Check the header** - Should show your initials and name
3. **Check the dashboard** - Should say "Welcome back, [Your Name]!"
4. **Check mobile menu** - Should show name with email as subtitle

## Future Enhancements

You can extend this by:

1. **Add first_name and last_name fields** for more structured data
2. **Add user profile edit page** where users can update their own name
3. **Add avatar/profile picture upload** to replace initials
4. **Add name to admin user management** to allow admins to set names

## SQL Migration File

The migration SQL has been saved to: `add-name-column.sql`

Run this file in your Supabase SQL Editor to add the name column to your users table.
