# HTTP Tests (curl and PowerShell)
# Replace placeholders:
# <ACCESS_TOKEN> = user's JWT
# <TARGET_USER_ID> = uuid of a user in your system
# <USER_ID> = uuid of a user
# <DEPLOY_URL> = https://your-deployment.vercel.app or http://localhost:3000

## Create Post (POST)
curl -X POST "<DEPLOY_URL>/api/posts" ^
  -H "Authorization: Bearer <ACCESS_TOKEN>" ^
  -H "Content-Type: application/json" ^
  -d "{\"image_url\":\"https://example.com/image.jpg\",\"caption\":\"New post\",\"tags\":[\"street\",\"vintage\"]}"

# PowerShell
Invoke-RestMethod -Method Post -Uri "<DEPLOY_URL>/api/posts" -Headers @{ Authorization = "Bearer <ACCESS_TOKEN>" } -Body (@{ image_url="https://example.com/image.jpg"; caption="New post"; tags=@("street","vintage") } | ConvertTo-Json)

## Get Feed (GET)
curl -X GET "<DEPLOY_URL>/api/feed" -H "Authorization: Bearer <ACCESS_TOKEN>"

# PowerShell
Invoke-RestMethod -Method Get -Uri "<DEPLOY_URL>/api/feed" -Headers @{ Authorization = "Bearer <ACCESS_TOKEN>" }

## Create Taste Match (POST)
curl -X POST "<DEPLOY_URL>/api/taste-match" ^
  -H "Authorization: Bearer <ACCESS_TOKEN>" ^
  -H "Content-Type: application/json" ^
  -d "{\"matched_user_id\":\"<TARGET_USER_ID>\",\"score\":0.85}"

# PowerShell
Invoke-RestMethod -Method Post -Uri "<DEPLOY_URL>/api/taste-match" -Headers @{ Authorization = "Bearer <ACCESS_TOKEN>" } -Body (@{ matched_user_id="<TARGET_USER_ID>"; score=0.85 } | ConvertTo-Json)

## Get Taste Matches (GET)
curl -X GET "<DEPLOY_URL>/api/taste-matches" -H "Authorization: Bearer <ACCESS_TOKEN>"

# PowerShell
Invoke-RestMethod -Method Get -Uri "<DEPLOY_URL>/api/taste-matches" -Headers @{ Authorization = "Bearer <ACCESS_TOKEN>" }

## Follow / Unfollow (POST)
# Follow
curl -X POST "<DEPLOY_URL>/api/follow" ^
  -H "Authorization: Bearer <ACCESS_TOKEN>" ^
  -H "Content-Type: application/json" ^
  -d "{\"target_user_id\":\"<TARGET_USER_ID>\",\"action\":\"follow\"}"

# Unfollow
curl -X POST "<DEPLOY_URL>/api/follow" ^
  -H "Authorization: Bearer <ACCESS_TOKEN>" ^
  -H "Content-Type: application/json" ^
  -d "{\"target_user_id\":\"<TARGET_USER_ID>\",\"action\":\"unfollow\"}"

# PowerShell follow
Invoke-RestMethod -Method Post -Uri "<DEPLOY_URL>/api/follow" -Headers @{ Authorization = "Bearer <ACCESS_TOKEN>" } -Body (@{ target_user_id="<TARGET_USER_ID>"; action="follow" } | ConvertTo-Json)

## Get Profile (GET)
# By id:
curl -X GET "<DEPLOY_URL>/api/profile?id=<USER_ID>" -H "Authorization: Bearer <ACCESS_TOKEN>"

# PowerShell
Invoke-RestMethod -Method Get -Uri "<DEPLOY_URL>/api/profile?id=<USER_ID>" -Headers @{ Authorization = "Bearer <ACCESS_TOKEN>" }
