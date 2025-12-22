import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ssekkfxkigyavgljszpc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzZWtrZnhraWd5YXZnbGpzenBjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc0Njk4NiwiZXhwIjoyMDgxMzIyOTg2fQ.UqfZDevGXHTbijukszTeV2GthnAIzmT00SpeaJkSq4Q';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSchema() {
  console.log('🔍 Inspecting table schemas...\n');
  
  // Check income_categories table
  console.log('📋 Checking app_40611b53f9_income_categories:');
  const { data: catData, error: catError } = await supabase
    .from('app_40611b53f9_income_categories')
    .select('*')
    .limit(1);
  
  if (catError) {
    console.log('❌ Error:', catError.message);
  } else {
    console.log('✅ Table accessible');
    console.log('   Sample data:', catData);
  }
  
  // Try inserting a test record
  console.log('\n🧪 Testing insert with category_id...');
  const { data: insertData, error: insertError } = await supabase
    .from('app_40611b53f9_income_categories')
    .insert({
      category_id: 'test_category',
      division_name: 'Test Division',
      category_name: 'Test Category',
      description: 'Test description'
    })
    .select();
  
  if (insertError) {
    console.log('❌ Insert error:', insertError.message);
    console.log('   Details:', insertError);
  } else {
    console.log('✅ Insert successful:', insertData);
    
    // Clean up test record
    await supabase
      .from('app_40611b53f9_income_categories')
      .delete()
      .eq('category_id', 'test_category');
  }
}

inspectSchema();
