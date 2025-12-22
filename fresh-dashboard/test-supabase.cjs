const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ssekkfxkigyavgljszpc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzZWtrZnhraWd5YXZnbGpzenBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3NDY5ODYsImV4cCI6MjA4MTMyMjk4Nn0.WwpNzeqzyrd9IdpQPmdm5F5XkoKpVO57MFLMu-zKCJA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test auth
    const { data: authData, error: authError } = await supabase.auth.getSession();
    console.log('Auth test:', authError ? 'Failed' : 'Success', authError?.message);
    
    // Test a simple query
    const { data, error } = await supabase
      .from('_test_table')
      .select('*')
      .limit(1);
    
    if (error && error.code === '42P01') {
      console.log('Connection successful but table does not exist (expected)');
      return true;
    }
    
    console.log('Connection test result:', error ? 'Failed' : 'Success', error?.message);
    return !error;
  } catch (err) {
    console.error('Connection test error:', err.message);
    return false;
  }
}

async function main() {
  const connected = await testConnection();
  
  if (connected) {
    console.log('\n✅ Supabase connection successful!');
    console.log('\nDatabase tables need to be created:');
    console.log('\nPlease follow these steps:');
    console.log('1. Go to https://supabase.com/dashboard/project/ssekkfxkigyavgljszpc');
    console.log('2. Click on "SQL Editor" in the left sidebar');
    console.log('3. Create a new query');
    console.log('4. Copy and paste the SQL from the file: /workspace/shadcn-ui/database-setup.sql');
    console.log('5. Run the query to create all tables');
    console.log('\nThe application will then use real database data instead of mock data');
  } else {
    console.log('\n❌ Supabase connection failed.');
    console.log('\nPossible issues:');
    console.log('1. Check if the Supabase project is active');
    console.log('2. Verify the URL and anon key are correct');
    console.log('3. Check network connectivity');
    console.log('\nCurrent configuration:');
    console.log('URL:', supabaseUrl);
    console.log('Anon Key:', supabaseAnonKey ? 'Present (first 20 chars): ' + supabaseAnonKey.substring(0, 20) + '...' : 'Missing');
  }
}

main().catch(console.error);