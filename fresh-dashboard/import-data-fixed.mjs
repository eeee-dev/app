import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://ssekkfxkigyavgljszpc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzZWtrZnhraWd5YXZnbGpzenBjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc0Njk4NiwiZXhwIjoyMDgxMzIyOTg2fQ.UqfZDevGXHTbijukszTeV2GthnAIzmT00SpeaJkSq4Q';

const supabase = createClient(supabaseUrl, supabaseKey);

async function importCategories() {
  console.log('🎯 Step 1: Importing income categories...');
  
  // First, check what categories already exist
  const { data: existing } = await supabase
    .from('app_40611b53f9_income_categories')
    .select('*');
  
  console.log('📋 Found', existing?.length || 0, 'existing categories');
  
  const categories = [
    { name: 'Music Production', description: 'Studio recording, mixing, mastering', default_division: 'ë • musique', color: '#FF6B6B' },
    { name: 'Live Performance', description: 'Concerts, shows, live events', default_division: 'ë • musique', color: '#FF8787' },
    { name: 'Music Licensing', description: 'Royalties, sync licensing', default_division: 'ë • musique', color: '#FFA5A5' },
    { name: 'Video Production', description: 'Video shooting, editing, post-production', default_division: 'ë • visuals', color: '#4ECDC4' },
    { name: 'Photography', description: 'Photo shoots, editing, retouching', default_division: 'ë • visuals', color: '#6EDDD6' },
    { name: 'Graphic Design', description: 'Branding, logos, marketing materials', default_division: 'ë • visuals', color: '#8EEDE8' },
    { name: 'Software Development', description: 'Web, mobile, custom software', default_division: 'ë • tech', color: '#95E1D3' },
    { name: 'IT Services', description: 'Infrastructure, support, maintenance', default_division: 'ë • tech', color: '#A8E6CF' },
    { name: 'Event Management', description: 'Planning, coordination, execution', default_division: 'ë • events', color: '#FFD93D' },
    { name: 'Event Production', description: 'Stage, sound, lighting, AV', default_division: 'ë • events', color: '#FFE66D' },
    { name: 'Business Consulting', description: 'Strategy, operations, growth', default_division: 'ë • consulting', color: '#A8DADC' },
    { name: 'Creative Consulting', description: 'Brand strategy, creative direction', default_division: 'ë • consulting', color: '#C8E4E6' }
  ];
  
  // Insert only new categories
  for (const cat of categories) {
    const exists = existing?.find(e => e.name === cat.name);
    if (!exists) {
      const { error } = await supabase
        .from('app_40611b53f9_income_categories')
        .insert(cat);
      
      if (error) {
        console.log('⚠️  Skipping', cat.name, ':', error.message);
      } else {
        console.log('✅ Added:', cat.name);
      }
    } else {
      console.log('⏭️  Already exists:', cat.name);
    }
  }
  
  console.log('✅ Category import completed');
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
  
  // Create a test user first
  const testEmail = 'admin@e-finance.mu';
  const testPassword = 'Admin123!';
  
  console.log('\n👤 Setting up user account...');
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true
  });
  
  let userId;
  if (authError) {
    if (authError.message.includes('already registered')) {
      console.log('✅ User already exists');
      const { data: users } = await supabase.auth.admin.listUsers();
      userId = users.users.find(u => u.email === testEmail)?.id;
    } else {
      console.error('❌ Error creating user:', authError.message);
      return false;
    }
  } else {
    userId = authData.user.id;
    console.log('✅ User created');
  }
  
  if (!userId) {
    console.error('❌ Could not find or create user');
    return false;
  }
  
  // Get all categories to map names to IDs
  const { data: categories } = await supabase
    .from('app_40611b53f9_income_categories')
    .select('*');
  
  const categoryMap = {
    'visuals_video': categories?.find(c => c.name === 'Video Production')?.id,
    'visuals_design': categories?.find(c => c.name === 'Graphic Design')?.id,
    'tech_development': categories?.find(c => c.name === 'Software Development')?.id,
    'events_production': categories?.find(c => c.name === 'Event Production')?.id,
    'consulting_creative': categories?.find(c => c.name === 'Creative Consulting')?.id
  };
  
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
  
  // Import category breakdowns with mapped IDs
  const breakdowns = mtData.category_breakdown
    .filter(b => categoryMap[b.category_id])
    .map(breakdown => ({
      income_id: incomeData.id,
      category_id: categoryMap[breakdown.category_id],
      amount: breakdown.amount,
      percentage: breakdown.percentage,
      notes: breakdown.notes || null
    }));
  
  if (breakdowns.length > 0) {
    const { error: breakdownError } = await supabase
      .from('app_40611b53f9_income_breakdowns')
      .insert(breakdowns);
    
    if (breakdownError) {
      console.error('❌ Error importing breakdowns:', breakdownError.message);
      return false;
    }
    
    console.log('✅ Category breakdowns imported:', breakdowns.length, 'items');
  }
  
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
