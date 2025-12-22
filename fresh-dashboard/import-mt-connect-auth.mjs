import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://ssekkfxkigyavgljszpc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzZWtrZnhraWd5YXZnbGpzenBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3NDY5ODYsImV4cCI6MjA4MTMyMjk4Nn0.WwpNzeqzyrd9IdpQPmdm5F5XkoKpVO57MFLMu-zKCJA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function importMTConnect() {
  try {
    console.log('🚀 Starting MT Connect import...\n');

    // Sign in
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'd@eeee.mu',
      password: 'poupS123*'
    });

    if (authError) {
      console.error('❌ Authentication error:', authError.message);
      return;
    }

    console.log(`✅ Successfully authenticated as: ${authData.user.email}\n`);

    // Read the prepared data
    const data = JSON.parse(fs.readFileSync('/workspace/fresh-dashboard/mt_connect_import.json', 'utf8'));

    // Insert the income record
    const incomeRecord = {
      user_id: authData.user.id,
      project_name: data.project_name,
      client_name: data.client_name,
      invoice_number: data.invoice_number,
      invoice_date: data.invoice_date,
      amount: data.amount,
      status: data.status,
      category_breakdown: data.category_breakdown,
      notes: data.notes,
      created_at: new Date().toISOString()
    };

    const { data: insertedIncome, error: insertError } = await supabase
      .from('income')
      .insert([incomeRecord])
      .select();

    if (insertError) {
      console.error('❌ Error inserting income record:', insertError.message);
      console.error('Error details:', insertError);
      return;
    }

    console.log('✅ Successfully imported MT Connect income record!\n');
    console.log('📊 Record Details:');
    console.log(`   Project: ${data.project_name}`);
    console.log(`   Client: ${data.client_name}`);
    console.log(`   Invoice: ${data.invoice_number}`);
    console.log(`   Amount: Rs ${data.amount.toLocaleString()}`);
    console.log(`   Categories: ${data.category_breakdown.length} categories mapped\n`);

    console.log('📈 Category Breakdown:');
    const divisionSummary = {};
    
    const categories = {
      'creative-direction': 'ë • visuals',
      'logo-design': 'ë • visuals',
      'design-work': 'ë • visuals',
      'presentation-design': 'ë • visuals',
      'screen-content': 'ë • visuals',
      'animation': 'ë • visuals',
      'video-production': 'ë • bōucan',
      'photography': 'ë • bōucan',
      'music-audio': 'ë • musiquë',
      'sustenance': 'ë • admin'
    };

    data.category_breakdown.forEach(cb => {
      const division = categories[cb.categoryId] || 'Unknown';
      if (!divisionSummary[division]) {
        divisionSummary[division] = 0;
      }
      divisionSummary[division] += cb.amount;
      console.log(`   ${cb.categoryId}: Rs ${cb.amount.toLocaleString()} (${cb.percentage}%)`);
    });

    console.log('\n🏢 Division Summary:');
    Object.entries(divisionSummary).forEach(([division, amount]) => {
      const percentage = ((amount / data.amount) * 100).toFixed(2);
      console.log(`   ${division}: Rs ${amount.toLocaleString()} (${percentage}%)`);
    });

    console.log('\n✨ Import complete! Check your Income Management page at https://office-eight-rho.vercel.app/income');

  } catch (error) {
    console.error('❌ Error during import:', error.message);
    console.error('Full error:', error);
  }
}

importMTConnect();