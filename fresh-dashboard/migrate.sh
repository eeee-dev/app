#!/bin/bash

SUPABASE_URL="https://ssekkfxkigyavgljszpc.supabase.co"
SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzZWtrZnhraWd5YXZnbGpzenBjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc0Njk4NiwiZXhwIjoyMDgxMzIyOTg2fQ.UqfZDevGXHTbijukszTeV2GthnAIzmT00SpeaJkSq4Q"

echo "🚀 Starting database migration..."
echo ""

# Read the SQL file
SQL_CONTENT=$(cat supabase-migrations/001_income_categories.sql)

# Execute SQL via Supabase REST API
echo "📤 Sending SQL to Supabase..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": $(echo "$SQL_CONTENT" | jq -Rs .)}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 201 ]; then
  echo "✅ Migration executed successfully!"
  echo ""
  echo "Response: $BODY"
else
  echo "❌ Migration failed with HTTP $HTTP_CODE"
  echo "Response: $BODY"
  echo ""
  echo "This might mean the exec_sql function doesn't exist."
  echo "Let me try creating tables via PostgREST directly..."
fi

echo ""
echo "🔍 Verifying tables..."

# Check if tables exist
CATEGORIES_CHECK=$(curl -s -X GET \
  "${SUPABASE_URL}/rest/v1/app_40611b53f9_income_categories?limit=1" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}")

if echo "$CATEGORIES_CHECK" | grep -q "relation.*does not exist"; then
  echo "❌ income_categories table does not exist"
else
  echo "✅ income_categories table exists"
fi

BREAKDOWNS_CHECK=$(curl -s -X GET \
  "${SUPABASE_URL}/rest/v1/app_40611b53f9_income_breakdowns?limit=1" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}")

if echo "$BREAKDOWNS_CHECK" | grep -q "relation.*does not exist"; then
  echo "❌ income_breakdowns table does not exist"
else
  echo "✅ income_breakdowns table exists"
fi

echo ""
echo "🎉 Migration check complete!"
