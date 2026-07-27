<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	import Logo from '$lib/components/Logo.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import Seo from '$lib/components/Seo.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let loading = $state(false);
</script>

<Seo title="Admin Login" canonical="/admin/login" noindex />

<div class="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
	<div class="w-full max-w-sm">
		<div class="flex justify-center">
			<a href="/"><Logo height={52} /></a>
		</div>
		<div class="mt-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
			<h1 class="text-center text-xl font-black tracking-tight text-slate-800">Staff sign in</h1>
			<p class="mt-1 text-center text-sm text-slate-500">Manage the ABK parts catalogue</p>

			{#if form?.error}
				<div
					class="mt-5 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700"
				>
					<Icon name="alert" size={16} />
					{form.error}
				</div>
			{/if}

			<form
				method="POST"
				class="mt-5 space-y-4"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						await update();
						loading = false;
					};
				}}
			>
				<div>
					<label for="email" class="mb-1 block text-sm font-semibold text-slate-700">Email</label>
					<input
						id="email"
						name="email"
						type="email"
						autocomplete="username"
						required
						value={form?.email ?? data.demoEmail ?? ''}
						class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-abk-blue"
					/>
				</div>
				<div>
					<label for="password" class="mb-1 block text-sm font-semibold text-slate-700"
						>Password</label
					>
					<input
						id="password"
						name="password"
						type="password"
						autocomplete="current-password"
						required
						value={data.demoPassword ?? ''}
						class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-abk-blue"
					/>
				</div>
				<button
					type="submit"
					disabled={loading}
					class="w-full rounded-lg bg-abk-blue px-4 py-2.5 text-sm font-bold text-white transition hover:bg-abk-navy disabled:opacity-60"
				>
					{loading ? 'Signing in…' : 'Sign in'}
				</button>
			</form>

			{#if data.demoMode}
				<div class="mt-5 rounded-lg bg-amber-50 px-3 py-3 text-xs text-amber-800">
					<p class="font-bold">Demo mode</p>
					<p class="mt-1">
						Supabase isn't configured, so the credentials above are pre-filled. Changes you make are
						kept in memory only. Connect Supabase (see the README) for real staff accounts and
						persistence.
					</p>
				</div>
			{/if}
		</div>
		<p class="mt-6 text-center text-sm text-slate-400">
			<a href="/" class="hover:text-abk-blue">← Back to site</a>
		</p>
	</div>
</div>
