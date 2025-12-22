import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://ssekkfxkigyavgljszpc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzZWtrZnhraWd5YXZnbGpzenBjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc0Njk4NiwiZXhwIjoyMDgxMzIyOTg2fQ.UqfZDevGXHTbijukszTeV2GthnAIzmT00SpeaJkSq4Q';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runExpenseMigration() {
  console.log('🚀 Starting Expense Tracking Migration...\n');
  
  try {
    // Read the SQL migration file
    const sql = fs.readFileSync('supabase-migrations/002_expense_tracking.sql', 'utf8');
    
    console.log('📝 Executing SQL migration...\n');
    
    // Execute the entire SQL script using the REST API
    const { data, error } = await supabase.rpc('exec_sql', { query: sql });
    
    if (error) {
      console.error('❌ Migration failed:', error.message);
      
      // Try alternative approach - execute SQL directly via REST API
      console.log('\n🔄 Trying alternative approach...');
      
      // Use fetch to execute SQL via REST API
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({
          query: sql
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Alternative approach failed:', errorText);
        
        // Manual approach - ask user to run SQL manually
        console.log('\n📋 MANUAL INSTRUCTIONS:');
        console.log('1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/ssekkfxkigyavgljszpc');
        console.log('2. Navigate to SQL Editor');
        console.log('3. Copy and paste the SQL from supabase-migrations/002_expense_tracking.sql');
        console.log('4. Click "Run"');
        console.log('\nThe SQL creates:');
        console.log('- expense_categories table with default categories');
        console.log('- expenses table for tracking expenses');
        console.log('- receivables table for tracking pending receivables');
        console.log('- All necessary indexes and RLS policies');
      } else {
        console.log('✅ Migration executed successfully via REST API');
      }
    } else {
      console.log('✅ Migration executed successfully');
    }
    
    // Verify tables were created
    console.log('\n🔍 Verifying expense tables...\n');
    
    const { data: categories, error: catError } = await supabase
      .from('app_40611b53f9_expense_categories')
      .select('*')
      .limit(5);
    
    if (catError) {
      console.error('❌ Error checking expense_categories table:', catError.message);
    } else {
      console.log(`✅ expense_categories table exists with ${categories?.length || 0} sample records`);
      if (categories && categories.length > 0) {
        console.log('   Sample categories:', categories.map(c => c.name).join(', '));
      }
    }
    
    const { data: expenses, error: expError } = await supabase
      .from('app_40611b53f9_expenses')
      .select('*')
      .limit(1);
    
    if (expError) {
      console.error('❌ Error checking expenses table:', expError.message);
    } else {
      console.log(`✅ expenses table exists`);
    }
    
    const { data: receivables, error: recError } = await supabase
      .from('app_40611b53f9_receivables')
      .select('*')
      .limit(1);
    
    if (recError) {
      console.error('❌ Error checking receivables table:', recError.message);
    } else {
      console.log(`✅ receivables table exists`);
    }
    
    console.log('\n🎉 Expense migration verification complete!\n');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    
    console.log('\n📋 MANUAL INSTRUCTIONS:');
    console.log('1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/ssekkfxkigyavgljszpc');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the SQL from supabase-migrations/002_expense_tracking.sql');
    console.log('4. Click "Run"');
    console.log('\nThe SQL creates:');
    console.log('- expense_categories table with default categories');
    console.log('- expenses table for tracking expenses');
    console.log('- receivables table for tracking pending receivables');
    console.log('- All necessary indexes and RLS policies');
  }
}

runExpenseMigration();