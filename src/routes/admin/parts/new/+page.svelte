<script lang="ts">
	import { url } from '$lib/paths';
	import { goto } from '$app/navigation';
	import Seo from '$lib/components/Seo.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import PartForm from '$lib/components/PartForm.svelte';
	import { emptyPartValues, parsePartForm } from '$lib/partForm';
	import { createPart } from '$lib/db';
	import { demoMode } from '$lib/auth.svelte';

	async function save(form: FormData) {
		const result = await parsePartForm(form);
		if (!result.ok) return result.errors;
		await createPart(result.input!);
		await goto(url('/admin/parts'), { invalidateAll: true });
	}
</script>

<Seo title="Add Part" canonical="/admin/parts/new" noindex />

<nav class="mb-4 flex items-center gap-1.5 text-sm text-slate-500">
	<a href={url('/admin/parts')} class="hover:text-abk-blue">Parts</a>
	<Icon name="chevron" size={14} />
	<span class="text-slate-800">New</span>
</nav>

<h1 class="mb-6 text-2xl font-black tracking-tight text-slate-800">Add a new part</h1>

<PartForm values={emptyPartValues()} submitLabel="Create part" {demoMode} {save} />
