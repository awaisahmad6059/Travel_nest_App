import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import { fileSystemStorage } from "./fileSystemStorage";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "https://vozgnbqjqiaabkrpniqb.supabase.co";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvemduYnFqcWlhYWJrcnBuaXFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1NDcxNDcsImV4cCI6MjEwMjEyMzE0N30.FZw3B3m90QQxiF0sisNRRuEeRj9JO1QIBpAdcL4cv-M";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: fileSystemStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
