import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Checking database state...');
console.log('Supabase URL:', supabaseUrl);
console.log('Anon Key present:', !!supabaseAnonKey);
console.log('Service Role Key present:', !!supabaseServiceRoleKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

// Create client with anon key (for testing user access)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create client with service role key (for admin access)
const supabaseAdmin = supabaseServiceRoleKey 
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null;

async function checkTables() {
  console.log('\n=== Checking Table Existence ===');
  
  const tables = [
    'app_40611b53f9_departments',
    'app_40611b53f9_projects',
    'app_40611b53f9_enhanced_income',
    'app_40611b53f9_expenses',
    'app_40611b53f9_income_breakdowns',
    'app_40611b53f9_income_categories'
  ];

  for (const table of tables) {
    try {
      // Try to query the table (limited to 1 row to check existence)
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: Exists (${data?.length || 0} rows)`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
    }
  }
}

async function checkRLSPolicies() {
  console.log('\n=== Checking RLS Policies ===');
  
  // Try to insert a test record to check if RLS allows it
  if (supabaseAdmin) {
    try {
      // First check if departments table exists and has data
      const { data: deptData, error: deptError } = await supabaseAdmin
        .from('app_40611b53f9_departments')
        .select('*')
        .limit(1);
      
      if (deptError) {
        console.log('❌ Cannot query departments table:', deptError.message);
      } else {
        console.log(`✅ Departments table accessible: ${deptData?.length || 0} rows`);
      }
    } catch (err) {
      console.log('❌ Error checking departments:', err.message);
    }
  } else {
    console.log('⚠️ Service role key not available for RLS check');
  }
}

async function checkDataCounts() {
  console.log('\n=== Checking Data Counts ===');
  
  const tables = [
    'app_40611b53f9_departments',
    'app_40611b53f9_enhanced_income',
    'app_40611b53f9_income_breakdowns',
    'app_40611b53f9_expenses'
  ];

  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`📊 ${table}: ${count} rows`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
    }
  }
}

async function main() {
  console.log('=== Financial Dashboard Database State Check ===');
  
  await checkTables();
  await checkRLSPolicies();
  await checkDataCounts();
  
  console.log('\n=== Summary ===');
  console.log('1. Check if tables exist');
  console.log('2. Check RLS policies (requires service role key)');
  console.log('3. Check data counts');
  console.log('\nIf tables show 0 rows, data needs to be imported.');
  console.log('If tables show errors, RLS policies may need fixing.');
}

main().catch(console.error);