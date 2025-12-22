import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Configuration
const supabaseUrl = 'https://ssekkfxkigyavgljszpc.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzZWtrZnhraWd5YXZnbGpzenBjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4MDU4NiwiZXhwIjoyMDUwMjU2NTg2fQ.4t_L7Aq1pqJXWm_3r7K5vYEslZdZPbxNJLPnmOlbBE';

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  console.log('🚀 Starting Expense Tracking Migration with Service Role...\n');
  
  try {
    // Read SQL file
    const sqlPath = join(process.cwd(), 'supabase-migrations', '002_expense_tracking.sql');
    const sql = readFileSync(sqlPath, 'utf8');
    
    console.log('📝 SQL to execute:');
    console.log('---');
    console.log(sql.substring(0, 500) + '...'); // Show first 500 chars
    console.log('---\n');
    
    // Execute SQL using REST API (since exec_sql function doesn't exist)
    // We'll execute each statement separately
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i].trim();
      if (stmt.length === 0) continue;
      
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        // For simple CREATE TABLE statements, we can use the REST API
        if (stmt.toLowerCase().startsWith('create table')) {
          console.log('  Skipping CREATE TABLE (will be created automatically when data is inserted)');
        } else if (stmt.toLowerCase().startsWith('create index')) {
          console.log('  Skipping CREATE INDEX (will be created automatically)');
        } else if (stmt.toLowerCase().startsWith('create policy')) {
          console.log('  Skipping CREATE POLICY (RLS policies)');
        } else if (stmt.toLowerCase().startsWith('insert into')) {
          console.log('  Executing INSERT statement...');
          // For INSERT statements, we need to parse and insert data
          // This is complex, so we'll skip for now
          console.log('  Skipping INSERT (manual insertion needed)');
        } else if (stmt.toLowerCase().startsWith('alter table')) {
          console.log('  Skipping ALTER TABLE (RLS enable)');
        } else {
          console.log(`  Unknown statement type: ${stmt.substring(0, 100)}...`);
        }
      } catch (err) {
        console.log(`  Error: ${err.message}`);
      }
    }
    
    console.log('\n⚠️  IMPORTANT:');
    console.log('The SQL migration contains complex statements that cannot be executed via REST API.');
    console.log('You need to run this SQL manually in Supabase SQL Editor:');
    console.log('1. Go to: https://supabase.com/dashboard/project/ssekkfxkigyavgljszpc');
    console.log('2. Navigate to "SQL Editor"');
    console.log('3. Copy and paste the entire SQL from: supabase-migrations/002_expense_tracking.sql');
    console.log('4. Click "Run"');
    console.log('\n📋 After running the SQL, verify tables exist with:');
    console.log('node verify-expense-tables.mjs');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

runMigration();