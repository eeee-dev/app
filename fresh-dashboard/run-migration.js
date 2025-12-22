const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://ssekkfxkigyavgljszpc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzZWtrZnhraWd5YXZnbGpzenBjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc0Njk4NiwiZXhwIjoyMDgxMzIyOTg2fQ.UqfZDevGXHTbijukszTeV2GthnAIzmT00SpeaJkSq4Q';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  console.log('🚀 Starting Income Category Breakdown Migration...\n');
  
  try {
    // Read the SQL migration file
    const sql = fs.readFileSync('supabase-migrations/001_income_categories.sql', 'utf8');
    
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--') && s !== 'BEGIN' && s !== 'COMMIT');
    
    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments and empty statements
      if (!statement || statement.startsWith('--')) continue;
      
      try {
        // Use REST API to execute SQL
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({ query: statement }),
        });
        
        if (response.ok) {
          successCount++;
          console.log(`✅ Statement ${i + 1}/${statements.length} executed successfully`);
        } else {
          const errorText = await response.text();
          // Ignore "already exists" errors
          if (errorText.includes('already exists') || errorText.includes('duplicate')) {
            console.log(`⚠️  Statement ${i + 1}/${statements.length} - Object already exists (skipped)`);
            successCount++;
          } else {
            console.error(`❌ Statement ${i + 1}/${statements.length} failed: ${errorText}`);
            errorCount++;
          }
        }
      } catch (err) {
        console.error(`❌ Statement ${i + 1}/${statements.length} error:`, err.message);
        errorCount++;
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`✅ Migration completed: ${successCount} successful, ${errorCount} errors`);
    console.log('='.repeat(60) + '\n');
    
    // Verify tables were created
    console.log('🔍 Verifying tables...\n');
    
    const { data: categories, error: catError } = await supabase
      .from('app_40611b53f9_income_categories')
      .select('*')
      .limit(5);
    
    if (catError) {
      console.error('❌ Error checking income_categories table:', catError.message);
    } else {
      console.log(`✅ income_categories table exists with ${categories?.length || 0} sample records`);
      if (categories && categories.length > 0) {
        console.log('   Sample categories:', categories.map(c => c.name).join(', '));
      }
    }
    
    const { data: breakdowns, error: breakError } = await supabase
      .from('app_40611b53f9_income_breakdowns')
      .select('*')
      .limit(1);
    
    if (breakError) {
      console.error('❌ Error checking income_breakdowns table:', breakError.message);
    } else {
      console.log(`✅ income_breakdowns table exists`);
    }
    
    console.log('\n🎉 Migration verification complete!\n');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
