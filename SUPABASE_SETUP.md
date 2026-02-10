# Supabase Setup Guide

This guide will walk you through setting up Supabase for your multi-user news aggregator.

## Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign in with GitHub (or create account)
4. Click "New project"
5. Fill in:
   - **Name**: news-aggregator (or your choice)
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free tier is fine for development
6. Click "Create new project"
7. Wait 2-3 minutes for project to initialize

## Step 2: Get Your Environment Variables

Once your project is created:

1. Go to **Project Settings** (gear icon in sidebar)
2. Click **API** in the left menu
3. You'll see:
   - **Project URL** - Copy this (it's your `NEXT_PUBLIC_SUPABASE_URL`)
   - **anon public** key - Copy this (it's your `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - **service_role** key - Copy this (it's your `SUPABASE_SERVICE_ROLE_KEY`)
     - ⚠️ **CRITICAL**: Never expose service_role key to the browser!

## Step 3: Create Your .env.local File

In your project root (`/Users/ericcui/repos/news-aggregator`), update `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Encryption Secret (generate a random 32-character string)
ENCRYPTION_SECRET=your-32-character-secret-here-abc

# Existing Perplexity API Key (keep this for now, optional after setup)
PERPLEXITY_API_KEY=<KEY>
```

### Generate ENCRYPTION_SECRET

Run this command to generate a secure 32-character secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex').slice(0, 32))"
```

Or use this simple method:
```bash
openssl rand -base64 32 | head -c 32
```

## Step 4: Run Database Schema

1. In Supabase dashboard, click **SQL Editor** in sidebar
2. Click **New query**
3. Paste the following SQL and click **Run**:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (synced with Supabase Auth)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User API Keys table (encrypted)
CREATE TABLE public.user_api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  encrypted_api_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Tabs table
CREATE TABLE public.tabs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  last_refreshed_at TIMESTAMP WITH TIME ZONE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT topic_not_empty CHECK (char_length(trim(topic)) > 0)
);

-- Create indexes for performance
CREATE INDEX idx_tabs_user_id ON public.tabs(user_id);
CREATE INDEX idx_tabs_user_id_order ON public.tabs(user_id, display_order);
CREATE INDEX idx_user_api_keys_user_id ON public.user_api_keys(user_id);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tabs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for user_api_keys table
CREATE POLICY "Users can view own API key"
  ON public.user_api_keys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own API key"
  ON public.user_api_keys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own API key"
  ON public.user_api_keys FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own API key"
  ON public.user_api_keys FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for tabs table
CREATE POLICY "Users can view own tabs"
  ON public.tabs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tabs"
  ON public.tabs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tabs"
  ON public.tabs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tabs"
  ON public.tabs FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_api_keys_updated_at BEFORE UPDATE ON public.user_api_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tabs_updated_at BEFORE UPDATE ON public.tabs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

4. You should see "Success. No rows returned" - this means it worked!
5. Click **Table Editor** in sidebar to verify tables were created

## Step 5: Configure Google OAuth

### 5.1 Create Google OAuth Credentials

1. Go to https://console.cloud.google.com
2. Create a new project or select existing one
3. Go to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth client ID**
5. If prompted, configure the OAuth consent screen:
   - User Type: **External**
   - App name: **News Aggregator**
   - User support email: Your email
   - Developer contact: Your email
   - Click **Save and Continue** through all steps
6. Back to **Create OAuth client ID**:
   - Application type: **Web application**
   - Name: **News Aggregator**
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - Your production URL (when you deploy)
   - Authorized redirect URIs:
     - `https://[your-project-ref].supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback` (for development)
7. Click **Create**
8. Copy the **Client ID** and **Client Secret**

### 5.2 Configure in Supabase

1. In Supabase dashboard, go to **Authentication** (in sidebar)
2. Click **Providers**
3. Find **Google** and click to expand
4. Toggle **Enable Sign in with Google** to ON
5. Paste your:
   - **Client ID** (from Google Console)
   - **Client Secret** (from Google Console)
6. Click **Save**

### 5.3 Set Redirect URLs

1. Still in **Authentication**, click **URL Configuration** (left menu)
2. Set:
   - **Site URL**: `http://localhost:3000` (for development)
   - **Redirect URLs**: Add `http://localhost:3000/auth/callback`
3. Click **Save**

## Step 6: Verify Setup

### 6.1 Check Environment Variables

Make sure your `.env.local` has all 4 variables:
```bash
cat .env.local
```

You should see:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ENCRYPTION_SECRET`
- `PERPLEXITY_API_KEY` (optional, for backward compatibility)

### 6.2 Check Database Tables

In Supabase:
1. Go to **Table Editor**
2. You should see 3 tables:
   - `users`
   - `user_api_keys`
   - `tabs`
3. Click on each to verify the schema

### 6.3 Check RLS Policies

1. In **Table Editor**, click any table
2. Click the **Policies** tab
3. You should see policies like "Users can view own profile"
4. Verify each table has policies enabled

## Step 7: Test the Application

Now you're ready to test! Run:

```bash
npm run dev
```

Visit http://localhost:3000 and you should:
1. Be redirected to `/auth/login`
2. See "Sign in with Google" button
3. Click it to test Google OAuth flow

## Troubleshooting

### "Missing environment variables"
- Double-check `.env.local` exists in project root
- Restart dev server after adding env variables: `npm run dev`

### "Invalid login credentials" or OAuth error
- Verify Google OAuth credentials are correct in Supabase
- Check redirect URIs match exactly (no trailing slashes)
- Make sure your Supabase project URL is correct

### "Database error" or "permission denied"
- Verify RLS policies were created (check SQL ran successfully)
- Check that tables have RLS enabled (see Step 6.3)

### Google OAuth consent screen shows "unverified app"
- This is normal for development
- Click "Advanced" → "Go to News Aggregator (unsafe)" to continue
- For production, you'll need to verify your app with Google

## Next Steps

Once setup is complete and you can access the login page:

1. Test signing in with Google
2. You should be redirected to `/dashboard` (which doesn't exist yet - that's Phase 3!)
3. Let me know when you're ready and I'll continue with Phase 3: Tab System & Dashboard UI

## Security Reminders

- ✅ **Never commit** `.env.local` to git
- ✅ **Never expose** `SUPABASE_SERVICE_ROLE_KEY` to the browser
- ✅ **Never expose** `ENCRYPTION_SECRET` to the browser
- ✅ Only `NEXT_PUBLIC_*` variables are safe for the browser
- ✅ Keep your Google OAuth Client Secret secure
