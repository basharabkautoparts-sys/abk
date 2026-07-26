<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import type { PageData, ActionData } from './$types';
	import Seo from '$lib/components/Seo.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import PartForm from '$lib/components/PartForm.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	const values = $derived(form?.values ?? data.values);
</script>

<Seo title={`Edit ${data.part.name}`} canonical={`/admin/parts/${data.part.id}/edit`} noindex />

<nav class="mb-4 flex items-center gap-1.5 text-sm text-slate-500">
	<a href="/admin/parts" class="hover:text-abk-blue">Parts</a>
	<Icon name="chevron" size={14} />
	<span class="truncate text-slate-800">{data.part.name}</span>
</nav>

<div class="mb-6 flex flex-wrap items-center justify-between gap-3">
	<h1 class="text-2xl font-black tracking-tight text-slate-800">Edit part</h1>
	<a
		href={`/parts/${data.part.slug}`}
		target="_blank"
		class="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-abk-blue"
	>
		View on site <Icon name="arrow" size={15} />
	</a>
</div>

{#key data.part.id}
	<PartForm
		{values}
		errors={form?.errors ?? {}}
		submitLabel="Save changes"
		demoMode={page.data.demoMode}
		action="?/update"
	/>
{/key}

<!-- Danger zone -->
<div class="mt-8 rounded-2xl border border-red-200 bg-red-50/40 p-6">
	<h2 class="text-sm font-bold uppercase tracking-wider text-red-500">Danger zone</h2>
	<div class="mt-3 flex flex-wrap items-center justify-between gap-4">
		<p class="text-sm text-slate-600">Permanently delete this part from the catalogue.</p>
		<form
			method="POST"
			action="?/delete"
			use:enhance
			onsubmit={(e) => {
				if (!confirm(`Delete “${data.part.name}”? This cannot be undone.`)) e.preventDefault();
			}}
		>
			<button
				type="submit"
				class="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-bold text-abk-red hover:bg-red-50"
			>
				<Icon name="trash" size={16} /> Delete part
			</button>
		</form>
	</div>
</div>
