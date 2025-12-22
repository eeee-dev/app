import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ssekkfxkigyavgljszpc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzZWtrZnhraWd5YXZnbGpzenBjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc0Njk4NiwiZXhwIjoyMDgxMzIyOTg2fQ.UqfZDevGXHTbijukszTeV2GthnAIzmT00SpeaJkSq4Q';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyData() {
  console.log('🔍 Verifying database contents...\n');
  
  // Check income records
  const { data: income, error: incomeError } = await supabase
    .from('app_40611b53f9_enhanced_income')
    .select('*');
  
  if (incomeError) {
    console.error('❌ Error fetching income:', incomeError.message);
  } else {
    console.log(`✅ Income Records: ${income.length}`);
    if (income.length > 0) {
      const total = income.reduce((sum, i) => sum + i.amount, 0);
      console.log(`   Total Amount: Rs ${total.toLocaleString()}`);
      income.forEach(i => {
        console.log(`   - ${i.project_name}: Rs ${i.amount.toLocaleString()} (${i.status})`);
      });
    }
  }
  
  // Check income breakdowns
  const { data: breakdowns, error: breakdownError } = await supabase
    .from('app_40611b53f9_income_breakdowns')
    .select('*, app_40611b53f9_income_categories(name)');
  
  if (breakdownError) {
    console.error('❌ Error fetching breakdowns:', breakdownError.message);
  } else {
    console.log(`\n✅ Income Breakdowns: ${breakdowns.length}`);
    if (breakdowns.length > 0) {
      breakdowns.forEach(b => {
        console.log(`   - ${b.app_40611b53f9_income_categories.name}: Rs ${b.amount.toLocaleString()} (${b.percentage}%)`);
      });
    }
  }
  
  // Check income categories
  const { data: categories, error: catError } = await supabase
    .from('app_40611b53f9_income_categories')
    .select('*');
  
  if (catError) {
    console.error('❌ Error fetching categories:', catError.message);
  } else {
    console.log(`\n✅ Income Categories: ${categories.length}`);
    categories.forEach(c => console.log(`   - ${c.name}`));
  }
  
  console.log('\n📊 Database Status Summary:');
  console.log('   ✅ Income records:', income?.length || 0);
  console.log('   ✅ Income breakdowns:', breakdowns?.length || 0);
  console.log('   ✅ Income categories:', categories?.length || 0);
  
  if (income?.length > 0 && breakdowns?.length > 0) {
    console.log('\n🎉 SUCCESS! Your financial dashboard is ready!');
    console.log('\n📝 Login at http://localhost:5173/ with:');
    console.log('   Email: admin@e-finance.mu');
    console.log('   Password: Admin123!');
  }
}

verifyData().catch(console.error);
