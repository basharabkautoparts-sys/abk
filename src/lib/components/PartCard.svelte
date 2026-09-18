<script lang="ts">
	import { url } from '$lib/paths';
	import type { Part } from '$lib/types';
	import { t } from '$lib/i18n.svelte';
	import PartImage from './PartImage.svelte';

	interface Props {
		part: Part;
		eager?: boolean;
	}
	let { part, eager = false }: Props = $props();
</script>

<a
	href={url(`/parts/${part.slug}`)}
	aria-label={`${part.part_number ? `${part.part_number} — ` : ''}${part.brand.name} ${part.name}`}
	class="group block min-w-0 bg-white"
>
	<div class="aspect-square overflow-hidden bg-slate-50">
		<PartImage {part} {eager} class="transition duration-300 motion-safe:group-hover:scale-[1.03]" />
	</div>
	<div class="pt-4 pb-3">
		<h3 class="break-words text-base font-medium leading-snug text-slate-900 group-hover:text-abk-blue sm:text-lg">
			<span dir={part.part_number ? 'ltr' : undefined} class="inline-block">{part.part_number || part.name}</span>
		</h3>
		<p class="mt-1 text-xs uppercase tracking-wider text-slate-500">{part.brand.name}</p>
		{#if !part.in_stock}
			<p class="mt-2 text-xs text-slate-500">{t('part.backorderLong')}</p>
		{/if}
	</div>
</a>
