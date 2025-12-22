import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ssekkfxkigyavgljszpc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzZWtrZnhraWd5YXZnbGpzenBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3NDY5ODYsImV4cCI6MjA4MTMyMjk4Nn0.WwpNzeqzyrd9IdpQPmdm5F5XkoKpVO57MFLMu-zKCJA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyTables() {
  console.log('🔍 Verifying expense tracking tables...\n');
  
  const tables = [
    'app_40611b53f9_expense_categories',
    'app_40611b53f9_expenses',
    'app_40611b53f9_receivables'
  ];
  
  for (const tableName of tables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${tableName}: ${error.message}`);
      } else {
        console.log(`✅ ${tableName}: Table exists`);
      }
    } catch (err) {
      console.log(`❌ ${tableName}: ${err.message}`);
    }
  }
  
  console.log('\n📋 Summary:');
  console.log('If any tables are missing, you need to run the SQL migration manually:');
  console.log('1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/ssekkfxkigyavgljszpc');
  console.log('2. Navigate to SQL Editor');
  console.log('3. Copy and paste the SQL from supabase-migrations/002_expense_tracking.sql');
  console.log('4. Click "Run"');
}

verifyTables();