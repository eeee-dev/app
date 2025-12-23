#!/usr/bin/env python3
"""
Direct database installation script for Supabase
This script will create all necessary tables using the Supabase REST API
"""

import requests
import json

# Supabase credentials
SUPABASE_URL = "https://ssekkfxkigyavgljszpc.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzZWtrZnhraWd5YXZnbGpzenBjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc0Njk4NiwiZXhwIjoyMDgxMzIyOTg2fQ.4gq7VkKqE_EQjj-FVrUMSXNQCvOIH0WBqCCTKKOLCKs"

# Read the SQL file
with open('/workspace/fresh-dashboard/setup-database.sql', 'r') as f:
    sql_content = f.read()

# Execute SQL via Supabase REST API
url = f"{SUPABASE_URL}/rest/v1/rpc/exec_sql"
headers = {
    "apikey": SUPABASE_SERVICE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
    "Content-Type": "application/json"
}

# Try direct SQL execution endpoint
sql_url = f"{SUPABASE_URL}/rest/v1/rpc"
payload = {
    "query": sql_content
}

print("Installing database tables...")
print(f"Connecting to: {SUPABASE_URL}")

try:
    # Use PostgREST to execute raw SQL
    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/rpc",
        headers=headers,
        json={"sql": sql_content}
    )
    
    if response.status_code == 200:
        print("✅ Database tables created successfully!")
        print(response.json())
    else:
        print(f"❌ Error: {response.status_code}")
        print(response.text)
        
        # Try alternative method using psycopg2
        print("\nTrying alternative installation method...")
        import subprocess
        result = subprocess.run([
            'psql',
            f'postgresql://postgres.ssekkfxkigyavgljszpc:{SUPABASE_SERVICE_KEY}@aws-0-us-west-1.pooler.supabase.com:6543/postgres',
            '-f', '/workspace/fresh-dashboard/setup-database.sql'
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Database installed successfully via psql!")
            print(result.stdout)
        else:
            print("❌ psql installation failed:")
            print(result.stderr)

except Exception as e:
    print(f"❌ Installation failed: {str(e)}")
    print("\n" + "="*50)
    print("MANUAL INSTALLATION REQUIRED")
    print("="*50)
    print("\nPlease follow these steps:")
    print("1. Go to: https://supabase.com/dashboard/project/ssekkfxkigyavgljszpc/sql/new")
    print("2. Copy the SQL from: /workspace/fresh-dashboard/setup-database.sql")
    print("3. Paste it into the SQL Editor")
    print("4. Click 'Run'")
    print("\nAfter running the SQL, your application at https://office.eeee.mu will work!")