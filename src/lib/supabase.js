import { createClient } from '@supabase/supabase-js';

// Read at build time from .env.local (see .env.example). Nothing here is
// a real secret — VITE_SUPABASE_ANON_KEY is the public "anon" key, safe
// for client-side use because Supabase Row Level Security policies (see
// docs/ADMIN_CMS_ARCHITECTURE.md) control what it can actually do.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * True once a real Supabase project is configured (env vars set at build
 * time). False in this repo today, and false for anyone who clones it
 * without setting up .env.local — the site must keep working either way,
 * which is exactly what `isSupabaseConfigured` lets every caller check
 * before relying on `supabase`.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/**
 * The Supabase client, or `null` when not configured. Never assume this
 * is non-null — always branch on `isSupabaseConfigured` first (or use
 * `fetchWithFallback`, see src/lib/content/fetchWithFallback.js, which
 * does this for you).
 */
export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;
