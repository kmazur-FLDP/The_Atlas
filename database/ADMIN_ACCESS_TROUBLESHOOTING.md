# Admin Access Troubleshooting Guide

## The Problem

You're logged in and can access the dashboard, but when you try to access `/admin`, you get "Access Denied" and an infinite redirect loop.

## Root Cause

This happens when `isAdmin` returns `false` even though you're set as an admin in the database. The most common causes:

1. **RLS (Row Level Security) is blocking the query** - The database policy prevents reading the `is_admin` field
2. **User profile not synced** - Your auth user doesn't have a matching entry in `public.users`
3. **Session not refreshed** - Old session data is cached

---

## Solution Steps

### Step 1: Check Browser Console

1. Open the admin page: http://localhost:3001/admin
2. Open browser console (F12)
3. Look for these logs:
   - `🔍 Checking admin status for user: <your-user-id>`
   - `📊 Admin check response:` - Check if there's an error here
   - `✅ Admin status:` - Should show `true`
   - `🔐 ProtectedRoute Check:` - Check `isAdmin` value

**What you're looking for:**

- If you see an **error** in the admin check response, it's likely RLS blocking the query
- If `isAdmin: false` but no error, the database value might be wrong

---

### Step 2: Run Quick Fix SQL

Go to Supabase Dashboard → SQL Editor and run this:

```sql
-- Check if you can read your own user data
SELECT
  id,
  email,
  is_admin,
  company_id
FROM public.users
WHERE id = auth.uid();
```

**If this returns NOTHING:**

- Your user doesn't exist in `public.users`
- Go back to `sync-users.sql` and run the INSERT statement

**If this returns your user but `is_admin = false`:**

```sql
UPDATE public.users
SET is_admin = TRUE
WHERE id = auth.uid();
```

**If this returns a permissions error:**

- RLS is blocking the read
- Run `quick-fix-rls.sql` to fix policies

---

### Step 3: Test with RLS Disabled (Debugging)

To confirm RLS is the issue, temporarily disable it:

```sql
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
```

Now try accessing `/admin` again.

- ✅ **If it works:** RLS was the problem. Run `quick-fix-rls.sql` to fix policies properly
- ❌ **If it still doesn't work:** The issue is elsewhere

**IMPORTANT:** Don't forget to re-enable RLS after testing:

```sql
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
```

---

### Step 4: Use Debug Page

Navigate to: http://localhost:3001/debug-auth

This page will show you:

- Your authentication status
- Your user profile data
- Direct database query results
- The exact value of `isAdmin()`

Look for discrepancies between:

- Database query showing `is_admin: true`
- But `isAdmin()` function returning `false`

This indicates RLS is blocking the read.

---

### Step 5: Sign Out and Back In

After making database changes:

1. Click "Sign Out"
2. Clear browser cache/cookies (optional but recommended)
3. Sign back in
4. Try accessing `/admin` again

The session needs to refresh to pick up the new admin status.

---

## Quick Reference Commands

### Check your user exists and is admin:

```sql
SELECT id, email, is_admin
FROM public.users
WHERE id = auth.uid();
```

### Make yourself admin:

```sql
UPDATE public.users
SET is_admin = TRUE
WHERE id = auth.uid();
```

### Fix RLS policies:

```sql
-- Drop old policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can only view their own data" ON public.users;

-- Create simple policy
CREATE POLICY "allow_own_user_read"
ON public.users FOR SELECT TO authenticated
USING (auth.uid() = id);
```

### Check what policies exist:

```sql
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'users';
```

---

## Common Error Messages

### "Access Denied" with User ID shown

- User exists but `is_admin = false` in database
- Run the UPDATE command to set `is_admin = TRUE`

### "Access Denied" with no User ID

- User not logged in properly
- Session expired
- Sign out and back in

### Console shows error in admin check

- RLS policy blocking the query
- Run `quick-fix-rls.sql` to fix policies

### Infinite redirect loop

- `isAuthenticated = true` but `isAdmin = false`
- The ProtectedRoute keeps redirecting
- Fix the admin status in database

---

## After Fixing

1. ✅ Database shows `is_admin = TRUE`
2. ✅ RLS policies allow reading own data
3. ✅ Sign out and back in
4. ✅ Check debug page shows `isAdmin: true`
5. ✅ Access `/admin` successfully

---

## Still Not Working?

If you've tried everything:

1. Share the browser console output (all the emoji logs)
2. Share the output from the debug page
3. Share the result of running the SELECT query above

This will help identify the exact issue.
