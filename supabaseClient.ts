
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseKey) {
	// Log a clear warning so missing envs are visible in Vercel/GitHub Actions logs
	// (this is safer than embedding a production key in source control).
	// In production you should set these env vars in Vercel dashboard.
	// Example names: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
	// The app will still attempt to create the client (may error at runtime).
	// Keep this lightweight and safe for builds.
	// eslint-disable-next-line no-console
	console.warn('Missing Supabase env vars: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
