import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bxsylvytnnpbbneyhkcs.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4c3lsdnl0bm5wYmJuZXloa2NzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MjE2NjIsImV4cCI6MjA4MjA5NzY2Mn0.ExNM5lJeTqrTp4lxYkkwyCdps43Zh2HqoEAHnEAzeU0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Disable all caching for Supabase queries
supabase.from = new Proxy(supabase.from, {
  apply(target, thisArg, args) {
    const result = Reflect.apply(target, thisArg, args);
    // Add timestamp to force fresh data
    const timestamp = Date.now();
    return {
      ...result,
      select: (...selectArgs: Parameters<typeof result.select>) => {
        const query = result.select(...selectArgs);
        // Force no cache by adding timestamp
        return {
          ...query,
          headers: {
            ...query.headers,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'X-Request-Time': timestamp.toString()
          }
        };
      }
    };
  }
});