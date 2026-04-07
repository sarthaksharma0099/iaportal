import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL      = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;
const SUPABASE_SVC_KEY  = process.env.REACT_APP_SUPABASE_SERVICE_KEY;

// Public client — used by investor portal (respects RLS)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Admin client — used by admin panel only (bypasses RLS)
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SVC_KEY);
