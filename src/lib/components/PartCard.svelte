<script lang="ts">
	import type { Part } from '$lib/types';
	import { categoryBySlug } from '$lib/config';
	import PartImage from './PartImage.svelte';
	import Icon from './Icon.svelte';

	interface Props {
		part: Part;
		eager?: boolean;
	}
	let { part, eager = false }: Props = $props();

	const categoryIcon = $derived(categoryBySlug(part.category.slug)?.icon ?? 'part');
</script>

<a
	href={`/parts/${part.slug}`}
	class="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[var(--shadow-card)] transition duration-200 hover:-translate-y-1 hover:border-abk-blue/30 hover:shadow-lg"
>
	<div class="relative aspect-[4/3] overflow-hidden">
		<PartImage {part} {eager} class="transition duration-300 group-hover:scale-[1.06]" />

		<span
			class="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-abk-blue shadow-sm ring-1 ring-abk-blue/10"
		>
			<Icon name={categoryIcon} size={12} />
			{part.category.name}
		</span>

		{#if part.featured}
			<span
				class="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full bg-abk-red px-2 py-1 text-[11px] font-bold text-white shadow-sm"
			>
				<Icon name="star" size={11} stroke={0} class="fill-current" /> Featured
			</span>
		{/if}

		{#if !part.in_stock}
			<span
				class="absolute bottom-0 left-0 right-0 bg-slate-900/75 py-1 text-center text-[11px] font-semibold text-white"
			>
				Available on backorder
			</span>
		{/if}
	</div>

	<div class="flex flex-1 flex-col p-4">
		<!-- Vehicle brand this part is for -->
		<p class="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wide text-abk-red">
			<Icon name="car" size={13} />
			{part.brand.name}
		</p>
		<h3
			class="mt-1 line-clamp-2 font-bold leading-snug text-slate-800 group-hover:text-abk-blue"
		>
			{part.name}
		</h3>
		<p class="mt-1 font-mono text-xs text-slate-500">No. {part.part_number}</p>

		<div class="mt-auto flex items-end justify-between pt-4">
			<span
				class="rounded bg-abk-sky px-1.5 py-0.5 text-[10px] font-bold uppercase text-abk-blue"
				>{part.condition}</span
			>
			<span
				class="flex items-center gap-1 text-xs font-bold text-abk-blue opacity-0 transition group-hover:opacity-100"
			>
				View <Icon name="arrow" size={14} />
			</span>
		</div>
	</div>
</a>
