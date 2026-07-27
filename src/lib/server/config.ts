import { env as pub } from '$env/dynamic/public';
import { env as priv } from '$env/dynamic/private';

export const SUPABASE_URL = pub.PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = pub.PUBLIC_SUPABASE_ANON_KEY ?? '';

/** When false, the app runs in DEMO MODE (bundled seed data + demo login). */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/** Demo admin credentials, used only when Supabase is not configured. */
export const DEMO_ADMIN_EMAIL = priv.DEMO_ADMIN_EMAIL || 'admin@abkautoparts.local';
export const DEMO_ADMIN_PASSWORD = priv.DEMO_ADMIN_PASSWORD || 'abk-demo-admin';

/** Bucket that holds part images in Supabase Storage. */
export const PART_IMAGES_BUCKET = 'part-images';
