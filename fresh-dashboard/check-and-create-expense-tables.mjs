import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ssekkfxkigyavgljszpc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzZWtrZnhraWd5YXZnbGpzenBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3NDY5ODYsImV4cCI6MjA4MTMyMjk4Nn0.WwpNzeqzyrd9IdpQPmdm5F5XkoKpVO57MFLMu-zKCJA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndCreateTables() {
  console.log('🔍 Checking expense tracking tables...\n');
  
  try {
    // Check if expense_categories table exists
    const { data: categories, error: catError } = await supabase
      .from('app_40611b53f9_expense_categories')
      .select('*')
      .limit(1);
    
    if (catError && catError.code === '42P01') {
      console.log('❌ expense_categories table does not exist');
      console.log('   Need to run the expense migration script');
    } else if (catError) {
      console.log('⚠️ Error checking expense_categories:', catError.message);
    } else {
      console.log(`✅ expense_categories table exists`);
      if (categories && categories.length > 0) {
        console.log(`   Contains ${categories.length} categories`);
      }
    }
    
    // Check if expenses table exists
    const { data: expenses, error: expError } = await supabase
      .from('app_40611b53f9_expenses')
      .select('*')
      .limit(1);
    
    if (expError && expError.code === '42P01') {
      console.log('❌ expenses table does not exist');
      console.log('   Need to run the expense migration script');
    } else if (expError) {
      console.log('⚠️ Error checking expenses:', expError.message);
    } else {
      console.log(`✅ expenses table exists`);
    }
    
    // Check if receivables table exists
    const { data: receivables, error: recError } = await supabase
      .from('app_40611b53f9_receivables')
      .select('*')
      .limit(1);
    
    if (recError && recError.code === '42P01') {
      console.log('❌ receivables table does not exist');
      console.log('   Need to run the expense migration script');
    } else if (recError) {
      console.log('⚠️ Error checking receivables:', recError.message);
    } else {
      console.log(`✅ receivables table exists`);
    }
    
    console.log('\n📋 Summary:');
    console.log('   If any tables are missing, you need to:');
    console.log('   1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/ssekkfxkigyavgljszpc');
    console.log('   2. Navigate to SQL Editor');
    console.log('   3. Run the SQL from supabase-migrations/002_expense_tracking.sql');
    console.log('\n   Or ask the developer to fix the BackendManager authentication issue.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkAndCreateTables();