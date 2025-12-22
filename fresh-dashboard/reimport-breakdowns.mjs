import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://ssekkfxkigyavgljszpc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzZWtrZnhraWd5YXZnbGpzenBjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc0Njk4NiwiZXhwIjoyMDgxMzIyOTg2fQ.UqfZDevGXHTbijukszTeV2GthnAIzmT00SpeaJkSq4Q';

const supabase = createClient(supabaseUrl, supabaseKey);

async function reimportBreakdowns() {
  console.log('🔄 Re-importing MT Connect breakdowns...\n');
  
  // Get the income record
  const { data: income, error: incomeError } = await supabase
    .from('app_40611b53f9_enhanced_income')
    .select('*')
    .eq('invoice_number', 'MT-CONNECT-001')
    .single();
  
  if (incomeError || !income) {
    console.error('❌ Could not find income record');
    return false;
  }
  
  console.log('✅ Found income record:', income.project_name);
  
  // Get all categories
  const { data: categories } = await supabase
    .from('app_40611b53f9_income_categories')
    .select('*');
  
  console.log('✅ Loaded', categories.length, 'categories');
  
  // Read MT Connect data
  const mtData = JSON.parse(readFileSync('./mt_connect_import.json', 'utf8'));
  
  // Map category IDs to database categories
  const categoryNameMap = {
    'creative-direction': 'Creative Direction',
    'logo-design': 'Logo Design',
    'design-work': 'Design Work',
    'presentation-design': 'Presentation Design',
    'screen-content': 'Screen Content',
    'animation': 'Animation',
    'video-production': 'Video Production',
    'photography': 'Photography',
    'music-audio': 'Music & Audio',
    'sustenance': 'Sustenance'
  };
  
  // Check if breakdowns already exist
  const { data: existingBreakdowns } = await supabase
    .from('app_40611b53f9_income_breakdowns')
    .select('*')
    .eq('income_id', income.id);
  
  if (existingBreakdowns && existingBreakdowns.length > 0) {
    console.log('⚠️  Breakdowns already exist, deleting old ones...');
    await supabase
      .from('app_40611b53f9_income_breakdowns')
      .delete()
      .eq('income_id', income.id);
  }
  
  // Create breakdowns
  const breakdowns = [];
  
  for (const item of mtData.category_breakdown) {
    const categoryName = categoryNameMap[item.categoryId];
    if (!categoryName) {
      console.log('⚠️  Skipping unknown category:', item.categoryId);
      continue;
    }
    
    const category = categories.find(c => c.name === categoryName);
    if (!category) {
      console.log('⚠️  Category not found in database:', categoryName);
      continue;
    }
    
    breakdowns.push({
      income_id: income.id,
      category_id: category.id,
      amount: item.amount,
      percentage: item.percentage,
      notes: item.notes
    });
    
    console.log(`   ✓ ${categoryName}: Rs ${item.amount.toLocaleString()}`);
  }
  
  console.log('\n📊 Importing', breakdowns.length, 'breakdowns...');
  
  const { data: inserted, error: insertError } = await supabase
    .from('app_40611b53f9_income_breakdowns')
    .insert(breakdowns)
    .select();
  
  if (insertError) {
    console.error('❌ Error inserting breakdowns:', insertError.message);
    console.error('   Details:', insertError);
    return false;
  }
  
  console.log('✅ Successfully imported', inserted.length, 'breakdowns!');
  
  // Verify
  const { data: verify } = await supabase
    .from('app_40611b53f9_income_breakdowns')
    .select('*, app_40611b53f9_income_categories(name)')
    .eq('income_id', income.id);
  
  console.log('\n📊 Verification:');
  verify.forEach(b => {
    console.log(`   - ${b.app_40611b53f9_income_categories.name}: Rs ${b.amount.toLocaleString()} (${b.percentage}%)`);
  });
  
  return true;
}

reimportBreakdowns().then(success => {
  if (success) {
    console.log('\n🎉 Breakdowns imported successfully!');
    console.log('\n📝 Login at http://localhost:5173/ with:');
    console.log('   Email: admin@e-finance.mu');
    console.log('   Password: Admin123!');
  } else {
    console.error('\n❌ Import failed');
    process.exit(1);
  }
}).catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
