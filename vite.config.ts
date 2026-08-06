import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  // Expose PUBLIC_* on import.meta.env. Unlike `$env/static/public`, a missing
  // variable becomes `undefined` instead of a build error — that is what lets
  // the app fall back to demo mode when Supabase is not configured.
  envPrefix: ['VITE_', 'PUBLIC_'],
  base: '/'
});
