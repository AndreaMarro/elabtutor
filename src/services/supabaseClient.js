/**
 * Supabase Client — singleton per ELAB Tutor
 * Configurazione via env vars: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
 * Se non configurato, ritorna null (fallback a auth locale).
 * © Andrea Marro — 31/03/2026
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export default supabase;

/** @returns {boolean} true se Supabase e configurato e pronto */
export function isSupabaseConfigured() {
  return !!supabase;
}
