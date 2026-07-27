<script lang="ts">
	import { categoryBySlug } from '$lib/taxonomy.svelte';
	import type { Part } from '$lib/types';
	import Icon from './Icon.svelte';

	interface Props {
		part: Part;
		class?: string;
		eager?: boolean;
	}
	let { part, class: cls = '', eager = false }: Props = $props();

	const img = $derived(part.images?.[0]);
	const icon = $derived(categoryBySlug(part.category.slug)?.icon ?? 'part');
</script>

{#if img}
	<img
		src={img}
		alt={part.name}
		class="h-full w-full object-cover {cls}"
		loading={eager ? 'eager' : 'lazy'}
		decoding="async"
	/>
{:else}
	<div
		class="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-abk-sky via-white to-slate-100 {cls}"
	>
		<Icon name={icon} size="46%" stroke={1.1} class="text-abk-blue/25" />
		<span
			class="absolute bottom-2 right-3 text-[10px] font-black uppercase tracking-widest text-abk-navy/25"
			>ABK</span
		>
	</div>
{/if}
