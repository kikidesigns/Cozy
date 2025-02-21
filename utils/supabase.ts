import "react-native-url-polyfill/auto"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = 'https://omthgqplimfvukqytmns.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tdGhncXBsaW1mdnVrcXl0bW5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk4MjgyOTEsImV4cCI6MjA1NTQwNDI5MX0.ooPEVQHOcx6k35b1EUcC9Dmu7h2Fixy3H0S8dd8u_uo';

console.log("Initializing Supabase client...");

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Log initial auth state
supabase.auth.getSession().then(({ data: { session }, error }) => {
  if (error) {
    console.error("Error getting initial session:", error);
  } else {
    console.log("Initial session state:", session ? "Authenticated" : "Not authenticated");
  }
});

// Listen for auth changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log("Auth state changed:", event, session ? "Authenticated" : "Not authenticated");
});