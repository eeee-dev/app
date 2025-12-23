import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bxsylvytnnpbbneyhkcs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4c3lsdnl0bm5wYmJuZXloa2NzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MjE2NjIsImV4cCI6MjA4MjA5NzY2Mn0.ExNM5lJeTqrTp4lxYkkwyCdps43Zh2HqoEAHnEAzeU0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);