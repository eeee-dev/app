import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ssekkfxkigyavgljszpc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzZWtrZnhraWd5YXZnbGpzenBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3NDY5ODYsImV4cCI6MjA4MTMyMjk4Nn0.WwpNzeqzyrd9IdpQPmdm5F5XkoKpVO57MFLMu-zKCJA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAuthAndData() {
  console.log('\n=== Checking Authentication ===\n');
  
  // Check current session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.error('Session Error:', sessionError.message);
  } else if (session) {
    console.log('User authenticated:', session.user.email);
  } else {
    console.log('No active session - user needs to log in');
  }

  console.log('\n=== Checking Data (without auth) ===\n');

  // Check income categories
  const { data: categories, error: catError } = await supabase
    .from('app_40611b53f9_income_categories')
    .select('*')
    .limit(5);
  
  console.log('Income Categories:', categories?.length || 0, 'records');
  if (categories && categories.length > 0) {
    console.log('Sample categories:', categories.map(c => c.name).join(', '));
  }
  if (catError) console.error('Categories Error:', catError.message);

  // Check enhanced income
  const { data: income, error: incomeError } = await supabase
    .from('app_40611b53f9_enhanced_income')
    .select('*')
    .limit(5);
  
  console.log('Enhanced Income:', income?.length || 0, 'records');
  if (incomeError) console.error('Income Error:', incomeError.message);

  // Check expenses
  const { data: expenses, error: expenseError } = await supabase
    .from('app_40611b53f9_expenses')
    .select('*')
    .limit(5);
  
  console.log('Expenses:', expenses?.length || 0, 'records');
  if (expenseError) console.error('Expense Error:', expenseError.message);

  // Check departments
  const { data: departments, error: deptError } = await supabase
    .from('app_40611b53f9_departments')
    .select('*');
  
  console.log('Departments:', departments?.length || 0, 'records');
  if (departments && departments.length > 0) {
    console.log('Department names:', departments.map(d => d.name).join(', '));
  }
  if (deptError) console.error('Department Error:', deptError.message);

  // Check RLS policies
  console.log('\n=== RLS Policy Issue ===');
  console.log('The tables have Row Level Security enabled, but no data is visible without authentication.');
  console.log('This means users must be logged in to see any data.');
  console.log('\nPossible solutions:');
  console.log('1. Disable RLS for read operations (not recommended for production)');
  console.log('2. Add policies that allow authenticated users to read all data');
  console.log('3. Ensure users are properly authenticated before accessing data');
}

checkAuthAndData().catch(console.error);
