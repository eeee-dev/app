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
    .select('*, app_40611b53f9_income_categories(name, division)');
  
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
  
  // Check departments
  const { data: departments, error: deptError } = await supabase
    .from('app_40611b53f9_departments')
    .select('*');
  
  if (deptError) {
    console.error('❌ Error fetching departments:', deptError.message);
  } else {
    console.log(`\n✅ Departments: ${departments.length}`);
    departments.forEach(d => console.log(`   - ${d.name}`));
  }
  
  // Check expenses
  const { data: expenses, error: expError } = await supabase
    .from('app_40611b53f9_expenses')
    .select('*');
  
  if (expError) {
    console.error('❌ Error fetching expenses:', expError.message);
  } else {
    console.log(`\n✅ Expenses: ${expenses.length}`);
  }
  
  console.log('\n📊 Database Status Summary:');
  console.log('   Income records:', income?.length || 0);
  console.log('   Income breakdowns:', breakdowns?.length || 0);
  console.log('   Departments:', departments?.length || 0);
  console.log('   Expenses:', expenses?.length || 0);
}

verifyData().catch(console.error);
