import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ssekkfxkigyavgljszpc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzZWtrZnhraWd5YXZnbGpzenBjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc0Njk4NiwiZXhwIjoyMDgxMzIyOTg2fQ.UqfZDevGXHTbijukszTeV2GthnAIzmT00SpeaJkSq4Q';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('🔍 Checking database tables...\n');
  
  const tables = [
    'app_40611b53f9_income_categories',
    'app_40611b53f9_enhanced_income',
    'app_40611b53f9_income_breakdowns'
  ];
  
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    
    if (error) {
      console.log(`❌ Table ${table}: NOT FOUND or ERROR`);
      console.log(`   Error: ${error.message}`);
    } else {
      console.log(`✅ Table ${table}: EXISTS`);
    }
  }
  
  console.log('\n⚠️ The database tables were not created properly.');
  console.log('\n📋 SOLUTION: Please run the SQL script again in Supabase SQL Editor:');
  console.log('   1. Go to: https://supabase.com/dashboard/project/ssekkfxkigyavgljszpc/sql/new');
  console.log('   2. Copy the ENTIRE SQL script from /workspace/fresh-dashboard/database-setup.sql');
  console.log('   3. Paste and click "Run"');
  console.log('   4. Wait for "Database setup completed successfully!" message');
  console.log('\nAfter that, reply "done" and I\'ll immediately import your data! 🚀');
}

checkTables();
