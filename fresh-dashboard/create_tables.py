import requests
import json

SUPABASE_URL = "https://ssekkfxkigyavgljszpc.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzZWtrZnhraWd5YXZnbGpzenBjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc0Njk4NiwiZXhwIjoyMDgxMzIyOTg2fQ.UqfZDevGXHTbijukszTeV2GthnAIzmT00SpeaJkSq4Q"

print("🚀 Creating tables via Supabase Management API...\n")

# Read SQL file
with open('supabase-migrations/001_income_categories.sql', 'r') as f:
    sql = f.read()

# Try to execute via query endpoint
headers = {
    'apikey': SERVICE_KEY,
    'Authorization': f'Bearer {SERVICE_KEY}',
    'Content-Type': 'application/json'
}

# Use the query endpoint
url = f"{SUPABASE_URL}/rest/v1/rpc/query"
payload = {'query': sql}

print(f"📤 Sending SQL to {url}...")
response = requests.post(url, headers=headers, json=payload)

print(f"Status: {response.status_code}")
print(f"Response: {response.text[:500]}\n")

if response.status_code in [200, 201]:
    print("✅ Tables created successfully!")
else:
    print("❌ Failed to create tables via API")
    print("\n⚠️  The tables need to be created manually in Supabase SQL Editor")
    print("📋 Instructions:")
    print("1. Go to: https://supabase.com/dashboard/project/ssekkfxkigyavgljszpc/sql")
    print("2. Copy SQL from: /workspace/fresh-dashboard/supabase-migrations/001_income_categories.sql")
    print("3. Paste and run in SQL Editor")
    print("\n💡 Alternative: I can build the UI now and it will work once tables are created")

