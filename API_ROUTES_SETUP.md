# Next.js API Routes Setup Guide

## ✅ What Was Created

All 6 Next.js API routes are now ready:

```
app/api/
├── taste-match/route.ts     POST /api/taste-match        (create taste match)
├── taste-matches/route.ts   GET  /api/taste-matches      (get user's matches)
├── posts/route.ts           POST /api/posts              (create post)
├── feed/route.ts            GET  /api/feed               (public feed)
├── follow/route.ts          POST /api/follow             (follow user)
└── profile/route.ts         GET  /api/profile            (get profile + stats)
```

## ⚙️ Environment Variables

### Local Setup

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://qqdpeobwzwscxotigrwm.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your_service_role_key...
   ```

3. **Get your Service Role Key:**
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Select project: `qqdpeobwzwscxotigrwm`
   - Settings → API → Service Role Key (copy this)

4. **Make sure `.env.local` is in `.gitignore`** (already should be)

### Vercel Production Setup

1. Go to Vercel Project Settings → Environment Variables
2. Add:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://qqdpeobwzwscxotigrwm.supabase.co` (public, all environments)
   - `SUPABASE_SERVICE_ROLE_KEY` = `eyJ...` (secret, Production + Preview)

## 🚀 Run Locally

```bash
npm run dev
```

Server runs on `http://localhost:3000`

## 🧪 Test Endpoints

### 1. Get Public Feed (No Auth Required)
```bash
curl http://localhost:3000/api/feed
```

### 2. Get Profile
```bash
curl "http://localhost:3000/api/profile?user_id=<user-uuid>"
```

### 3. Create Post (Requires Auth)
First, get a user access token from Supabase Auth, then:

```bash
AUTH_TOKEN="eyJhbGc..."
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "image_url": "https://images.unsplash.com/photo-1234567890",
    "caption": "Amazing outfit!",
    "tags": ["fashion", "street"]
  }'
```

### 4. Create Taste Match
```bash
curl -X POST http://localhost:3000/api/taste-match \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "target_id": "<another-user-uuid>",
    "score": 87,
    "details": {"category": "fashion", "reason": "similar taste"}
  }'
```

### 5. Get Your Taste Matches
```bash
curl -H "Authorization: Bearer $AUTH_TOKEN" \
  http://localhost:3000/api/taste-matches
```

### 6. Follow User
```bash
curl -X POST http://localhost:3000/api/follow \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{"target_id": "<user-uuid>"}'
```

## 📤 Commit & Deploy

```bash
git add .
git commit -m "feat(api): add server-side Next.js API routes for posts, feed, profile, taste matches, follow"
git push origin feature/taste-match
```

Vercel automatically builds and deploys on push. Your routes will be live at:
- `https://your-vercel-app.vercel.app/api/feed`
- `https://your-vercel-app.vercel.app/api/posts`
- etc.

## ✨ What's Next

1. **Create Supabase client for frontend:** `lib/supabaseClient.ts`
2. **Add auth flow:** Sign up / login screens
3. **Call endpoints from React components** using the client
4. **Add like/unlike endpoints** (create `app/api/likes/route.ts`)

## 📋 Endpoint Response Format

All endpoints return JSON:

```json
{
  "data": {...},
  "error": null
}
```

Or on error:
```json
{
  "error": "Error message here"
}
```

## 🔐 Security Notes

- `SUPABASE_SERVICE_ROLE_KEY` is secret — **never commit to git**
- All authenticated endpoints validate the Bearer token server-side
- RLS policies on database tables prevent unauthorized access
- Frontend always uses the public `NEXT_PUBLIC_SUPABASE_URL`
