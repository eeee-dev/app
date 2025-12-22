import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Testing Service Role Key...');
console.log('Supabase URL:', supabaseUrl);
console.log('Service Role Key (first 20 chars):', supabaseServiceRoleKey?.substring(0, 20) + '...');

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

// Create client with service role key
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

async function testServiceRole() {
  console.log('\n=== Testing Service Role Key ===');
  
  try {
    // Test 1: Try to query a table
    console.log('Test 1: Querying departments table...');
    const { data: deptData, error: deptError } = await supabaseAdmin
      .from('app_40611b53f9_departments')
      .select('*')
      .limit(1);
    
    if (deptError) {
      console.log(`❌ Query failed: ${deptError.message}`);
      console.log(`Error code: ${deptError.code}`);
      console.log(`Error details: ${JSON.stringify(deptError.details)}`);
    } else {
      console.log(`✅ Query successful: ${deptData?.length || 0} rows returned`);
    }
    
    // Test 2: Try to insert a test record
    console.log('\nTest 2: Testing insert capability...');
    const testDept = {
      name: 'Test Department',
      description: 'Test department for service role verification'
    };
    
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('app_40611b53f9_departments')
      .insert([testDept])
      .select();
    
    if (insertError) {
      console.log(`❌ Insert failed: ${insertError.message}`);
      console.log(`Error code: ${insertError.code}`);
      
      // Check if it's an RLS policy issue
      if (insertError.message.includes('policy') || insertError.code === '42501') {
        console.log('⚠️ This appears to be an RLS policy issue');
        console.log('The service role key should bypass RLS, but it might not have proper permissions');
      }
    } else {
      console.log(`✅ Insert successful: Record created with ID ${insertData?.[0]?.id}`);
      
      // Clean up: delete the test record
      if (insertData?.[0]?.id) {
        await supabaseAdmin
          .from('app_40611b53f9_departments')
          .delete()
          .eq('id', insertData[0].id);
        console.log('✅ Test record cleaned up');
      }
    }
    
    // Test 3: Check if we can query other tables
    console.log('\nTest 3: Checking other tables...');
    const tables = [
      'app_40611b53f9_projects',
      'app_40611b53f9_enhanced_income',
      'app_40611b53f9_expenses',
      'app_40611b53f9_income_breakdowns',
      'app_40611b53f9_income_categories'
    ];
    
    for (const table of tables) {
      const { count, error } = await supabaseAdmin
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: ${count} rows`);
      }
    }
    
  } catch (err) {
    console.log(`❌ Unexpected error: ${err.message}`);
    console.log(err.stack);
  }
}

async function checkRLSStatus() {
  console.log('\n=== Checking RLS Status ===');
  
  // Create a client with anon key to test user access
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    // Test if anonymous user can read data
    const { data, error } = await supabaseAnon
      .from('app_40611b53f9_departments')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log(`❌ Anonymous user cannot read departments: ${error.message}`);
      if (error.message.includes('policy') || error.code === '42501') {
        console.log('⚠️ RLS is blocking anonymous access (this is expected for authenticated-only tables)');
      }
    } else {
      console.log(`✅ Anonymous user can read departments: ${data?.length || 0} rows`);
      console.log('⚠️ RLS might be too permissive or disabled for this table');
    }
  } catch (err) {
    console.log(`❌ Error checking RLS: ${err.message}`);
  }
}

async function main() {
  console.log('=== Service Role Key Diagnostic ===\n');
  
  await testServiceRole();
  await checkRLSStatus();
  
  console.log('\n=== Summary ===');
  console.log('1. If service role key queries fail with "Invalid API key", the key might be invalid');
  console.log('2. If service role key queries fail with RLS errors, the key might not have proper permissions');
  console.log('3. If anonymous user can read data, RLS might be disabled or too permissive');
  console.log('\nNext steps:');
  console.log('- Check if the service role key is correct in Supabase Dashboard → Settings → API');
  console.log('- Verify the key has "service_role" permission');
  console.log('- Check RLS policies in Supabase Dashboard → Authentication → Policies');
}

main().catch(console.error);