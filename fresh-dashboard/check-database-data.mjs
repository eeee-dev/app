import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ssekkfxkigyavgljszpc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzZWtrZnhraWd5YXZnbGpzenBjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4MDU4NiwiZXhwIjoyMDUwMjU2NTg2fQ.4t_L7Aq1pqJXWm_3r7K5vYEslZdZPbxNJLPnmOlbBE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkData() {
  console.log('\n=== Checking Database Tables ===\n');

  // List all tables
  const { data: tables, error: tablesError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .like('table_name', 'app_40611b53f9_%');
  
  if (tablesError) {
    console.error('Error listing tables:', tablesError);
  } else {
    console.log('Tables found:', tables?.map(t => t.table_name).join(', ') || 'none');
  }

  // Try with anon key instead
  const supabaseAnon = createClient(
    'https://ssekkfxkigyavgljszpc.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzZWtrZnhraWd5YXZnbGpzenBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3NDY5ODYsImV4cCI6MjA4MTMyMjk4Nn0.WwpNzeqzyrd9IdpQPmdm5F5XkoKpVO57MFLMu-zKCJA'
  );

  console.log('\n=== Testing with Anon Key ===\n');

  // Check income categories
  const { data: categories, error: catError } = await supabaseAnon
    .from('app_40611b53f9_income_categories')
    .select('*')
    .limit(5);
  
  console.log('Income Categories:', categories?.length || 0, 'records');
  if (catError) console.error('Categories Error:', catError.message);

  // Check enhanced income
  const { data: income, error: incomeError } = await supabaseAnon
    .from('app_40611b53f9_enhanced_income')
    .select('*')
    .limit(5);
  
  console.log('Enhanced Income:', income?.length || 0, 'records');
  if (incomeError) console.error('Income Error:', incomeError.message);
}

checkData().catch(console.error);
