// ── Supabase client ──────────────────────────────────────────────────────
let SUPABASE_URL = (window.ENV && window.ENV.SUPABASE_URL) || 'YOUR_SUPABASE_URL';
if (SUPABASE_URL.endsWith('/rest/v1/')) {
    SUPABASE_URL = SUPABASE_URL.replace('/rest/v1/', '');
} else if (SUPABASE_URL.endsWith('/rest/v1')) {
    SUPABASE_URL = SUPABASE_URL.replace('/rest/v1', '');
}
const SUPABASE_ANON_KEY = (window.ENV && window.ENV.SUPABASE_ANON_KEY) || 'YOUR_SUPABASE_ANON_KEY';
window.supabaseClient = window.supabase && SUPABASE_URL && SUPABASE_URL !== 'YOUR_SUPABASE_URL' ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
if (!window.supabaseClient) {
    console.error("Supabase client failed to initialize. Check environment variables.");
}
