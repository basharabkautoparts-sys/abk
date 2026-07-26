<script lang="ts">
	import { url } from '$lib/paths';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import Logo from '$lib/components/Logo.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { admin, demoMode, initAdminSession, signOut } from '$lib/auth.svelte';
	import { isUnder, routePath } from '$lib/query';

	let { children } = $props();

	const path = $derived(routePath(page.url.pathname));
	const isLogin = $derived(path === '/admin/login');

	const links = [
		{ href: '/admin', label: 'Dashboard', icon: 'grid', exact: true },
		{ href: '/admin/parts', label: 'Parts', icon: 'part', exact: false },
		{ href: '/admin/parts/new', label: 'Add part', icon: 'plus', exact: true }
	];

	function active(href: string, exact: boolean): boolean {
		return exact ? path === href : isUnder(path, href);
	}

	onMount(initAdminSession);

	// There is no server to guard the admin, so the route gate lives here.
	// Supabase RLS is the real boundary: an unauthenticated client cannot read
	// drafts or write anything no matter what it does with this UI.
	$effect(() => {
		if (!admin.ready) return;
		if (!admin.email && !isLogin) {
			const target = encodeURIComponent(path + page.url.search);
			goto(url(`/admin/login?redirectTo=${target}`), { replaceState: true });
		} else if (admin.email && isLogin) {
			goto(url('/admin'), { replaceState: true });
		}
	});

	async function logout() {
		await signOut();
		goto(url('/admin/login'), { replaceState: true });
	}
</script>

{#if !admin.ready}
	<div class="flex min-h-screen items-center justify-center bg-slate-100">
		<div class="flex flex-col items-center gap-3 text-slate-400">
			<Logo height={44} />
			<p class="text-sm font-semibold">Checking your session…</p>
		</div>
	</div>
{:else if isLogin}
	{@render children()}
{:else if admin.email}
	<div class="min-h-screen bg-slate-100">
		<!-- Top bar -->
		<header class="sticky top-0 z-30 border-b border-slate-200 bg-white">
			<div class="flex h-16 items-center gap-4 px-4 sm:px-6">
				<a href={url('/admin')} class="flex items-center gap-2">
					<Logo height={36} />
					<span class="hidden text-sm font-bold text-slate-400 sm:inline">Admin</span>
				</a>
				<div class="ml-auto flex items-center gap-3">
					{#if demoMode}
						<span
							class="hidden rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 sm:inline"
						>
							Demo mode — changes are not persisted
						</span>
					{/if}
					<a
						href={url('/')}
						target="_blank"
						class="hidden items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-abk-blue sm:flex"
					>
						View site <Icon name="arrow" size={15} />
					</a>
					<span class="hidden text-sm text-slate-500 md:inline">{admin.email}</span>
					<button
						type="button"
						onclick={logout}
						class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:border-abk-red hover:text-abk-red"
					>
						<Icon name="logout" size={15} /> Logout
					</button>
				</div>
			</div>
		</header>

		<div class="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6">
			<!-- Sidebar -->
			<aside class="hidden w-52 shrink-0 lg:block">
				<nav class="sticky top-24 space-y-1">
					{#each links as link}
						<a
							href={url(link.href)}
							class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition {active(
								link.href,
								link.exact
							)
								? 'bg-abk-blue text-white shadow-sm'
								: 'text-slate-600 hover:bg-white'}"
						>
							<Icon name={link.icon} size={18} />
							{link.label}
						</a>
					{/each}
				</nav>
			</aside>

			<!-- Content -->
			<main class="min-w-0 flex-1">
				<!-- Mobile nav -->
				<nav class="mb-4 flex gap-2 overflow-x-auto lg:hidden">
					{#each links as link}
						<a
							href={url(link.href)}
							class="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold {active(
								link.href,
								link.exact
							)
								? 'bg-abk-blue text-white'
								: 'bg-white text-slate-600'}"
						>
							<Icon name={link.icon} size={16} />
							{link.label}
						</a>
					{/each}
				</nav>

				{@render children()}
			</main>
		</div>
	</div>
{:else}
	<div class="flex min-h-screen items-center justify-center bg-slate-100">
		<p class="text-sm font-semibold text-slate-400">Redirecting to sign in…</p>
	</div>
{/if}
