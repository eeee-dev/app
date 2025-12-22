import { createClient } from '@supabase/supabase-js';

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

async function createTables() {
  console.log('\nCreating tables...');
  
  // This would require admin privileges or using the SQL editor
  console.log('Note: Table creation requires admin privileges or SQL editor access.');
  console.log('Please create tables manually in Supabase SQL Editor with:');
  console.log(`
    -- Create departments table
    CREATE TABLE IF NOT EXISTS app_40611b53f9_departments (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      budget DECIMAL(15,2) DEFAULT 0,
      spent DECIMAL(15,2) DEFAULT 0,
      manager VARCHAR(255),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
    );
    
    -- Create expenses table
    CREATE TABLE IF NOT EXISTS app_40611b53f9_expenses (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES auth.users NOT NULL,
      department_id UUID REFERENCES app_40611b53f9_departments(id),
      amount DECIMAL(15,2) NOT NULL,
      description TEXT NOT NULL,
      category VARCHAR(100) NOT NULL,
      date DATE NOT NULL,
      status VARCHAR(50) DEFAULT 'pending',
      receipt_url TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
    );
    
    -- And other tables as shown in the SQL script...
  `);
}

async function main() {
  const connected = await testConnection();
  
  if (connected) {
    console.log('\n✅ Supabase connection successful!');
    console.log('\nNext steps:');
    console.log('1. Go to https://supabase.com/dashboard/project/ssekkfxkigyavgljszpc');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Run the table creation SQL script');
    console.log('4. The application will then use real database data instead of mock data');
  } else {
    console.log('\n❌ Supabase connection failed.');
    console.log('\nPossible issues:');
    console.log('1. Check if the Supabase project is active');
    console.log('2. Verify the URL and anon key are correct');
    console.log('3. Check network connectivity');
  }
}

main().catch(console.error);