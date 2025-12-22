import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ssekkfxkigyavgljszpc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzZWtrZnhraWd5YXZnbGpzenBjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc0Njk4NiwiZXhwIjoyMDgxMzIyOTg2fQ.UqfZDevGXHTbijukszTeV2GthnAIzmT00SpeaJkSq4Q';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectIncomeTable() {
  console.log('🔍 Inspecting enhanced_income table structure...\n');
  
  const { data, error } = await supabase
    .from('app_40611b53f9_enhanced_income')
    .select('*')
    .limit(1);
  
  if (error) {
    console.log('❌ Error:', error.message);
  } else {
    console.log('✅ Table structure (sample record):');
    if (data && data.length > 0) {
      console.log(JSON.stringify(data[0], null, 2));
      console.log('\n📋 Available columns:', Object.keys(data[0]).join(', '));
    } else {
      console.log('   (No records found, trying to get column info...)');
      
      // Try inserting a minimal test record to see what columns are required
      const testRecord = {
        user_id: '00000000-0000-0000-0000-000000000000',
        invoice_number: 'TEST-001',
        client_name: 'Test Client',
        amount: 1000,
        date: '2024-01-01',
        status: 'pending'
      };
      
      const { error: testError } = await supabase
        .from('app_40611b53f9_enhanced_income')
        .insert(testRecord);
      
      if (testError) {
        console.log('Test insert error:', testError.message);
      }
    }
  }
}

inspectIncomeTable();
