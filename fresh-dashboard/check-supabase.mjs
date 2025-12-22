import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ssekkfxkigyavgljszpc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzZWtrZnhraWd5YXZnbGpzenBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3NDY5ODYsImV4cCI6MjA4MTMyMjk4Nn0.WwpNzeqzyrd9IdpQPmdm5F5XkoKpVO57MFLMu-zKCJA';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Testing Supabase connection...');

// Test connection by listing tables
const { data, error } = await supabase
  .from('app_40611b53f9_departments')
  .select('*')
  .limit(1);

if (error) {
  console.error('Error connecting to Supabase:', error.message);
  console.log('\nThis likely means the tables do not exist yet.');
} else {
  console.log('✓ Successfully connected to Supabase');
  console.log('Sample data:', data);
}

// Check auth
const { data: { user }, error: authError } = await supabase.auth.getUser();
if (authError) {
  console.log('\n⚠ No authenticated user (this is expected)');
} else {
  console.log('\n✓ Authenticated user:', user?.email);
}

process.exit(0);
