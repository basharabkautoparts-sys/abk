<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { site } from '$lib/config';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { isSupabaseConfigured } from '$lib/supabase';
	import { routePath } from '$lib/query';
	import { initAdminSession } from '$lib/auth.svelte';

	let { children, data } = $props();

	// Hide the public chrome inside the admin area (it has its own shell).
	const isAdmin = $derived(routePath(page.url.pathname).startsWith('/admin'));

	onMount(() => {
		// Pages are prerendered, so the first paint shows the catalogue as it
		// stood at the last deploy — right for crawlers, potentially stale for
		// people. Re-run the loads once hydrated to pick up anything the admin
		// has changed since.
		if (isSupabaseConfigured) invalidateAll();

		// Resolve any existing staff session so the header can offer the admin
		// link. Anonymous visitors resolve to null without a network call.
		initAdminSession();
	});
</script>

{#if isAdmin}
	{@render children()}
{:else}
	<div class="flex min-h-screen flex-col">
		<Header />
		<main class="flex-1">
			{@render children()}
		</main>
		<Footer />
	</div>

	<!-- Floating WhatsApp -->
	<a
		href={`https://wa.me/${site.whatsappNumber}`}
		target="_blank"
		rel="noopener"
		aria-label="Chat on WhatsApp"
		class="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105 hover:shadow-xl"
	>
		<Icon name="whatsapp" size={30} />
	</a>
{/if}

{#if data.demoMode}
	<div
		class="fixed bottom-5 left-5 z-40 flex items-center gap-2 rounded-full bg-amber-400 px-3.5 py-1.5 text-xs font-bold text-amber-950 shadow-md"
		title="Supabase is not configured — the site is serving bundled sample data."
	>
		<Icon name="alert" size={14} /> Demo mode
	</div>
{/if}
