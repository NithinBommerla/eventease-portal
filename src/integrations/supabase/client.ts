
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://tulcgxkzcfnohcdmsbvl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1bGNneGt6Y2Zub2hjZG1zYnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwNjU4MjUsImV4cCI6MjA1NjY0MTgyNX0.CiXHQerTKW10uglyKT3JIciTFboeSPMYUEzLC0JNv9A";

export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      storageKey: 'eventease-auth',
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    },
    realtime: {
      params: {
        eventsPerSecond: 1
      }
    },
    global: {
      fetch: (...args) => {
        // Add timeout to all fetch requests
        return Promise.race([
          fetch(args[0], args[1]),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), 15000)
          )
        ]) as Promise<Response>;
      }
    }
  }
);
