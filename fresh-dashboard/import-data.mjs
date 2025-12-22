import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://ssekkfxkigyavgljszpc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzZWtrZnhraWd5YXZnbGpzenBjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc0Njk4NiwiZXhwIjoyMDgxMzIyOTg2fQ.UqfZDevGXHTbijukszTeV2GthnAIzmT00SpeaJkSq4Q';

const supabase = createClient(supabaseUrl, supabaseKey);

async function importCategories() {
  console.log('🎯 Step 1: Importing income categories...');
  
  const categories = [
    { category_id: 'musique_production', division_name: 'ë • musique', category_name: 'Music Production', description: 'Studio recording, mixing, mastering' },
    { category_id: 'musique_performance', division_name: 'ë • musique', category_name: 'Live Performance', description: 'Concerts, shows, live events' },
    { category_id: 'musique_licensing', division_name: 'ë • musique', category_name: 'Music Licensing', description: 'Royalties, sync licensing' },
    { category_id: 'visuals_video', division_name: 'ë • visuals', category_name: 'Video Production', description: 'Video shooting, editing, post-production' },
    { category_id: 'visuals_photo', division_name: 'ë • visuals', category_name: 'Photography', description: 'Photo shoots, editing, retouching' },
    { category_id: 'visuals_design', division_name: 'ë • visuals', category_name: 'Graphic Design', description: 'Branding, logos, marketing materials' },
    { category_id: 'tech_development', division_name: 'ë • tech', category_name: 'Software Development', description: 'Web, mobile, custom software' },
    { category_id: 'tech_it', division_name: 'ë • tech', category_name: 'IT Services', description: 'Infrastructure, support, maintenance' },
    { category_id: 'events_management', division_name: 'ë • events', category_name: 'Event Management', description: 'Planning, coordination, execution' },
    { category_id: 'events_production', division_name: 'ë • events', category_name: 'Event Production', description: 'Stage, sound, lighting, AV' },
    { category_id: 'consulting_business', division_name: 'ë • consulting', category_name: 'Business Consulting', description: 'Strategy, operations, growth' },
    { category_id: 'consulting_creative', division_name: 'ë • consulting', category_name: 'Creative Consulting', description: 'Brand strategy, creative direction' }
  ];
  
  const { data, error } = await supabase
    .from('app_40611b53f9_income_categories')
    .upsert(categories, { onConflict: 'category_id' });
  
  if (error) {
    console.error('❌ Error importing categories:', error.message);
    return false;
  }
  
  console.log('✅ Successfully imported', categories.length, 'income categories');
  return true;
}

async function importMTConnectData() {
  console.log('\n🎯 Step 2: Importing MT Connect financial data...');
  
  // Read the parsed MT Connect data
  let mtData;
  try {
    mtData = JSON.parse(readFileSync('./mt_connect_import.json', 'utf8'));
  } catch (err) {
    console.error('❌ Error reading MT Connect data:', err.message);
    return false;
  }
  
  console.log('📊 Found MT Connect data');
  
  // Create a test user first (we'll use this for all imports)
  const testEmail = 'admin@e-finance.mu';
  const testPassword = 'Admin123!';
  
  console.log('\n👤 Creating test user account...');
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true
  });
  
  if (authError && !authError.message.includes('already registered')) {
    console.error('❌ Error creating user:', authError.message);
    return false;
  }
  
  const userId = authData?.user?.id || (await supabase.auth.admin.listUsers()).data.users.find(u => u.email === testEmail)?.id;
  
  if (!userId) {
    console.error('❌ Could not find or create user');
    return false;
  }
  
  console.log('✅ User account ready:', testEmail);
  
  // Import the income record
  const incomeRecord = {
    user_id: userId,
    invoice_number: mtData.invoice_number,
    client_name: mtData.client_name,
    client_email: mtData.client_email || null,
    client_phone: mtData.client_phone || null,
    client_address: mtData.client_address || null,
    amount: mtData.amount,
    date: mtData.date,
    due_date: mtData.due_date,
    status: mtData.status,
    description: mtData.description
  };
  
  const { data: incomeData, error: incomeError } = await supabase
    .from('app_40611b53f9_enhanced_income')
    .insert(incomeRecord)
    .select()
    .single();
  
  if (incomeError) {
    console.error('❌ Error importing income:', incomeError.message);
    return false;
  }
  
  console.log('✅ Income record imported:', incomeData.invoice_number);
  
  // Import category breakdowns
  const breakdowns = mtData.category_breakdown.map(breakdown => ({
    income_id: incomeData.id,
    category_id: breakdown.category_id,
    amount: breakdown.amount,
    percentage: breakdown.percentage,
    notes: breakdown.notes || null
  }));
  
  const { error: breakdownError } = await supabase
    .from('app_40611b53f9_income_breakdowns')
    .insert(breakdowns);
  
  if (breakdownError) {
    console.error('❌ Error importing breakdowns:', breakdownError.message);
    return false;
  }
  
  console.log('✅ Category breakdowns imported:', breakdowns.length, 'items');
  
  return true;
}

async function main() {
  console.log('🚀 Starting data import process...\n');
  
  const step1 = await importCategories();
  if (!step1) {
    console.error('\n❌ Import failed at step 1');
    process.exit(1);
  }
  
  const step2 = await importMTConnectData();
  if (!step2) {
    console.error('\n❌ Import failed at step 2');
    process.exit(1);
  }
  
  console.log('\n✅ All data imported successfully!');
  console.log('\n📝 Login credentials:');
  console.log('   Email: admin@e-finance.mu');
  console.log('   Password: Admin123!');
  console.log('\n🌐 Dashboard: http://localhost:5174/');
}

main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
