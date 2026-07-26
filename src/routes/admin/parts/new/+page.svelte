<script lang="ts">
	import { page } from '$app/state';
	import type { PageData, ActionData } from './$types';
	import Seo from '$lib/components/Seo.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import PartForm from '$lib/components/PartForm.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	const values = $derived(form?.values ?? data.values);
</script>

<Seo title="Add Part" canonical="/admin/parts/new" noindex />

<nav class="mb-4 flex items-center gap-1.5 text-sm text-slate-500">
	<a href="/admin/parts" class="hover:text-abk-blue">Parts</a>
	<Icon name="chevron" size={14} />
	<span class="text-slate-800">New</span>
</nav>

<h1 class="mb-6 text-2xl font-black tracking-tight text-slate-800">Add a new part</h1>

<PartForm
	{values}
	errors={form?.errors ?? {}}
	submitLabel="Create part"
	demoMode={page.data.demoMode}
/>
