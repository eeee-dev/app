#!/bin/bash

# Read the migration SQL file
SQL_CONTENT=$(cat migration-project-departments.sql)

# Supabase project details
PROJECT_REF="bxsylvytnnpbbneyhkcs"
SUPABASE_URL="https://bxsylvytnnpbbneyhkcs.supabase.co"
SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4c3lsdnl0bm5wYmJuZXloa2NzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjUyMTY2MiwiZXhwIjoyMDUyMDk3NjYyfQ.s3_4Hhup5dgoSE-KYFzW7Vn-JLiCPqH7-BUlgz_Tcxg"

# Execute SQL via REST API
curl -X POST "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": $(echo "$SQL_CONTENT" | jq -Rs .)}"

echo ""
echo "Migration executed!"
