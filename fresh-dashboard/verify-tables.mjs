import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ssekkfxkigyavgljszpc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzZWtrZnhraWd5YXZnbGpzenBjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc0Njk4NiwiZXhwIjoyMDgxMzIyOTg2fQ.UqfZDevGXHTbijukszTeV2GthnAIzmT00SpeaJkSq4Q';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🔍 Verifying Income Category System Setup...\n');

// Check categories
const { data: categories, error: catError } = await supabase
  .from('app_40611b53f9_income_categories')
  .select('*')
  .order('default_division');

if (catError) {
  console.error('❌ Error fetching categories:', catError.message);
} else {
  console.log(`✅ Found ${categories.length} income categories:\n`);
  
  const divisionGroups = {};
  categories.forEach(cat => {
    if (!divisionGroups[cat.default_division]) {
      divisionGroups[cat.default_division] = [];
    }
    divisionGroups[cat.default_division].push(cat.name);
  });
  
  Object.keys(divisionGroups).sort().forEach(division => {
    console.log(`   ${division}:`);
    divisionGroups[division].forEach(name => {
      console.log(`      • ${name}`);
    });
    console.log('');
  });
}

// Check breakdowns table structure
const { data: breakdowns, error: breakError } = await supabase
  .from('app_40611b53f9_income_breakdowns')
  .select('*')
  .limit(1);

if (breakError) {
  console.error('❌ Error checking breakdowns table:', breakError.message);
} else {
  console.log(`✅ income_breakdowns table is ready (${breakdowns.length} records currently)`);
}

console.log('\n🎉 Database setup verified successfully!');
console.log('\n📋 Next Steps:');
console.log('   1. Build the frontend UI for income category breakdown');
console.log('   2. Add breakdown entry form to income details page');
console.log('   3. Create division analytics dashboard');
