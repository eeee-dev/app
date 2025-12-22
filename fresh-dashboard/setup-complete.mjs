import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://ssekkfxkigyavgljszpc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzZWtrZnhraWd5YXZnbGpzenBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3NDY5ODYsImV4cCI6MjA4MTMyMjk4Nn0.WwpNzeqzyrd9IdpQPmdm5F5XkoKpVO57MFLMu-zKCJA';

console.log('🚀 Starting complete setup...\n');
console.log('⚠️  IMPORTANT: You need to run the SQL migration manually first!\n');
console.log('📋 Quick Steps:');
console.log('1. Go to: https://supabase.com/dashboard/project/ssekkfxkigyavgljszpc/sql');
console.log('2. Copy ALL the text from: /workspace/fresh-dashboard/supabase-migrations/001_income_categories.sql');
console.log('3. Paste it in the SQL Editor and click RUN');
console.log('4. Come back here and type: node setup-complete.mjs\n');
console.log('That\'s it! Just 3 simple steps.\n');

const supabase = createClient(supabaseUrl, supabaseKey);

// Check if user is authenticated
const { data: { user }, error: authError } = await supabase.auth.getUser();

if (authError || !user) {
  console.log('❌ Not authenticated. Please login first at: https://office-eight-rho.vercel.app/\n');
  process.exit(1);
}

console.log(`✅ Authenticated as: ${user.email}\n`);

// Check if tables exist
const { data: categories, error: catError } = await supabase
  .from('app_40611b53f9_income_categories')
  .select('count');

if (catError) {
  console.log('❌ Tables not created yet. Please run the SQL migration first (see steps above).\n');
  process.exit(1);
}

console.log('✅ Database tables found!\n');

// Import MT Connect data
console.log('📥 Importing MT Connect data...\n');

const importData = JSON.parse(fs.readFileSync('/workspace/fresh-dashboard/mt_connect_import.json', 'utf8'));

const { data: income, error: incomeError } = await supabase
  .from('app_40611b53f9_enhanced_income')
  .insert({
    ...importData.income,
    user_id: user.id
  })
  .select()
  .single();

if (incomeError) {
  console.error('❌ Error inserting income:', incomeError.message);
  process.exit(1);
}

console.log('✅ Income record created!\n');

// Import breakdowns
for (const breakdown of importData.breakdowns) {
  const { error: breakdownError } = await supabase
    .from('app_40611b53f9_income_breakdowns')
    .insert({
      ...breakdown,
      income_id: income.id
    });

  if (breakdownError) {
    console.error(`❌ Error inserting breakdown: ${breakdownError.message}`);
  }
}

console.log('✅ All category breakdowns imported!\n');
console.log('🎉 Setup complete! Your MT Connect project is now in the dashboard.\n');
console.log('View it at: https://office-eight-rho.vercel.app/\n');
