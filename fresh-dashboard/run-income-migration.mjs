import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://ssekkfxkigyavgljszpc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzZWtrZnhraWd5YXZnbGpzenBjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc0Njk4NiwiZXhwIjoyMDgxMzIyOTg2fQ.s_CtFLYVJJOXwvxWBNzJvfvdMYLlxZLqRpLmDRm_2hg';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('🚀 Running income categories migration...\n');

    // Read the SQL migration file
    const sql = fs.readFileSync('/workspace/fresh-dashboard/supabase-migrations/001_income_categories.sql', 'utf8');

    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error('❌ Migration error:', error.message);
      console.log('\n⚠️  The migration needs to be run manually in Supabase SQL Editor.');
      console.log('Please follow these steps:');
      console.log('1. Go to: https://supabase.com/dashboard/project/ssekkfxkigyavgljszpc/sql');
      console.log('2. Copy the contents of: /workspace/fresh-dashboard/supabase-migrations/001_income_categories.sql');
      console.log('3. Paste and run in the SQL Editor');
      return false;
    }

    console.log('✅ Migration completed successfully!\n');
    return true;

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n⚠️  The migration needs to be run manually in Supabase SQL Editor.');
    console.log('Please follow these steps:');
    console.log('1. Go to: https://supabase.com/dashboard/project/ssekkfxkigyavgljszpc/sql');
    console.log('2. Copy the contents of: /workspace/fresh-dashboard/supabase-migrations/001_income_categories.sql');
    console.log('3. Paste and run in the SQL Editor');
    return false;
  }
}

runMigration();
