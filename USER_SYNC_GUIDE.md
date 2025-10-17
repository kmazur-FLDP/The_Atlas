# User Sync Guide - Fix Missing User Profile

## 🔴 Problem

Your Supabase Auth user exists, but your profile wasn't created in the `public.users` table. This happens when:

1. The trigger didn't fire during sign-up
2. You signed up before the trigger was created
3. There was an error during user creation

## ✅ Solution

### **Step 1: Go to Supabase Dashboard**

1. Visit https://app.supabase.com
2. Select your project: `igpliwujskveyqvgmfpt`
3. Click **SQL Editor** in the left sidebar

---

### **Step 2: Run the Sync Script**

I've created a file called `sync-users.sql` with all the commands. Here's what to do:

#### **Option A: Run Each Section (Recommended)**

Copy and run each section separately to see what's happening:

#### 1. **Check Auth Users**

```sql
SELECT
  id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC;
```

**Expected:** You should see your email here

---

#### 2. **Check Public Users**

```sql
SELECT
  id,
  email,
  is_admin,
  company_id
FROM public.users
ORDER BY created_at DESC;
```

**Expected:** Your email might be missing here (that's the problem!)

---

#### 3. **Sync Missing Users** (This fixes it!)

```sql
INSERT INTO public.users (id, email, is_admin, created_at)
SELECT
  au.id,
  au.email,
  FALSE as is_admin,
  au.created_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;
```

**Expected:** Should insert 1 or more rows (including yours)

---

#### 4. **Make Yourself Admin**

```sql
UPDATE public.users
SET is_admin = TRUE
WHERE email = 'your-actual-email@example.com';
```

⚠️ **IMPORTANT:** Replace `'your-actual-email@example.com'` with your real email!

**Expected:** Should update 1 row

---

#### 5. **Verify Everything Worked**

```sql
SELECT
  email,
  is_admin,
  company_id,
  created_at
FROM public.users
ORDER BY created_at DESC;
```

**Expected:** You should now see your email with `is_admin: true`

---

### **Step 3: Test It**

1. **Sign out** of The Atlas (http://localhost:3001)
2. **Sign back in**
3. **Visit the admin panel:** http://localhost:3001/admin
4. **Success!** 🎉 You should now see the admin dashboard

---

## 🔧 Alternative: Manual Insert (If Above Doesn't Work)

If the sync script doesn't work, you can manually create your user profile:

### 1. Get your user ID from auth:

```sql
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
```

Copy the `id` (it's a UUID like `123e4567-e89b-12d3-a456-426614174000`)

### 2. Insert into public.users:

```sql
INSERT INTO public.users (id, email, is_admin, created_at)
VALUES (
  'paste-your-user-id-here',
  'your-email@example.com',
  TRUE,  -- Making you admin right away
  NOW()
);
```

---

## 🎯 What Each Command Does

| Command                          | Purpose                         |
| -------------------------------- | ------------------------------- |
| `SELECT FROM auth.users`         | Shows users in Supabase Auth    |
| `SELECT FROM public.users`       | Shows user profiles in your app |
| `INSERT INTO public.users`       | Creates missing user profiles   |
| `UPDATE ... SET is_admin = TRUE` | Makes you an admin              |

---

## 🐛 Troubleshooting

### "User already exists" error

- Your profile already exists! Just run the UPDATE command to make yourself admin

### "Permission denied" error

- You might not have RLS permissions. The SQL Editor should bypass this, but if not:

```sql
-- Temporarily disable RLS (run as admin)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Run your INSERT/UPDATE commands

-- Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
```

### Still can't access admin panel?

1. Check browser console for errors (F12)
2. Verify `is_admin` is actually `true` in the database
3. Clear cookies and sign in again
4. Make sure you're signed in with the correct email

---

## 📋 Quick Reference

### Check if you're an admin:

```sql
SELECT email, is_admin
FROM public.users
WHERE email = 'your-email@example.com';
```

### Make someone else admin:

```sql
UPDATE public.users
SET is_admin = TRUE
WHERE email = 'their-email@example.com';
```

### Remove admin access:

```sql
UPDATE public.users
SET is_admin = FALSE
WHERE email = 'someone@example.com';
```

### Assign to a company:

```sql
UPDATE public.users
SET company_id = (SELECT id FROM companies WHERE name = 'Company Name')
WHERE email = 'your-email@example.com';
```

---

## ✅ Success Checklist

- [ ] Ran sync script in Supabase SQL Editor
- [ ] Saw your user inserted into public.users
- [ ] Set is_admin = TRUE for your email
- [ ] Verified with SELECT query
- [ ] Signed out and back in
- [ ] Can access /admin page

---

## 🚀 After You're an Admin

Once you have admin access, you can:

- Create companies: `/admin/companies`
- Manage users: `/admin/users`
- Create projects: `/admin/projects`
- Add maps: `/admin/maps`
- Control access: `/admin/access`

---

**Need Help?** If you're still having issues after following these steps, share:

1. The output of the SELECT queries
2. Any error messages you see
3. Your Supabase project ID (if different from the one I have)

Let's get you admin access! 🎯
