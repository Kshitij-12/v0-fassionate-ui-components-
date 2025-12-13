# FASSIONATE Backend Setup

## Prerequisites
- Supabase CLI installed: `npm install -g supabase`
- Linked to project: `qqdpeobwzwscxotigrwm`
- Environment variables set in Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

## Setup Commands

### 1. Push migrations to Supabase
\`\`\`bash
npx supabase db push --linked
\`\`\`

### 2. Generate TypeScript types
\`\`\`bash
npx supabase gen types --linked --lang typescript --schema public > supabase/generated/types.ts
\`\`\`

### 3. Set Vercel environment variables
Add to your Vercel project:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your service role key (keep secret!)

## Test Commands

Replace `<access_token>` with a valid JWT from Supabase Auth.

### POST /api/posts (Create post)
\`\`\`bash
curl -X POST http://localhost:3000/api/posts \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "caption": "loving this drip",
    "image_url": "https://example.com/image.jpg",
    "tags": ["DRIPLORDS", "VINTAGE"]
  }'
\`\`\`

### GET /api/feed (Get feed)
\`\`\`bash
curl -H "Authorization: Bearer <access_token>" \
  http://localhost:3000/api/feed?limit=50
\`\`\`

### POST /api/taste-match (Create taste match)
\`\`\`bash
curl -X POST http://localhost:3000/api/taste-match \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "matched_user_id": "uuid-here",
    "match_percentage": 85
  }'
\`\`\`

### GET /api/taste-matches (Get all matches)
\`\`\`bash
curl -H "Authorization: Bearer <access_token>" \
  http://localhost:3000/api/taste-matches
\`\`\`

### POST /api/follow (Follow/unfollow user)
\`\`\`bash
curl -X POST http://localhost:3000/api/follow \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "following_id": "uuid-here",
    "action": "follow"
  }'
\`\`\`

### GET /api/profile (Get profile)
\`\`\`bash
curl -H "Authorization: Bearer <access_token>" \
  http://localhost:3000/api/profile?user_id=optional-uuid
\`\`\`

### PATCH /api/profile (Update profile)
\`\`\`bash
curl -X PATCH http://localhost:3000/api/profile \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newusername",
    "avatar_url": "https://example.com/avatar.jpg"
  }'
\`\`\`
