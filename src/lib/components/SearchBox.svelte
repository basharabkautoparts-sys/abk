<script lang="ts">
	import { untrack } from 'svelte';
	import { url } from '$lib/paths';
	import { goto } from '$app/navigation';
	import { listParts } from '$lib/db';
	import { t } from '$lib/i18n.svelte';
	import type { Part } from '$lib/types';
	import Icon from './Icon.svelte';
	import PartImage from './PartImage.svelte';

	interface Props {
		/** Starting term, e.g. when the catalogue page already has one applied. */
		value?: string;
		/** Fill the container instead of sitting at a fixed width. */
		block?: boolean;
		placeholder?: string;
		/** Called after a suggestion is picked — the mobile menu closes on it. */
		onnavigate?: () => void;
		class?: string;
	}
	let {
		value = '',
		block = false,
		placeholder = undefined,
		onnavigate = undefined,
		class: cls = ''
	}: Props = $props();

	const MAX_SUGGESTIONS = 7;
	const DEBOUNCE_MS = 180;

	/**
	 * The box owns the term once it is mounted — `value` is only the starting
	 * point, because a keystroke must never be overwritten by a URL update that
	 * is still in flight. The effect below re-adopts `value` when it changes for
	 * some *other* reason: a link into /parts?q=…, or the back button.
	 */
	let term = $state(untrack(() => value));
	let lastValue = untrack(() => value);

	$effect(() => {
		if (value !== lastValue) {
			lastValue = value;
			term = value;
		}
	});

	let results = $state<Part[]>([]);
	let open = $state(false);
	let loading = $state(false);
	/** -1 = the input itself; 0..n-1 = a suggestion; n = the "see all" row. */
	let cursor = $state(-1);
	let root = $state<HTMLElement | null>(null);

	let timer: ReturnType<typeof setTimeout>;
	/**
	 * Only the newest query may write to `results`. Without this a slow request
	 * for "43" can land after a fast one for "43330" and repopulate the list
	 * with the wrong parts.
	 */
	let latest = 0;

	const trimmed = $derived(term.trim());
	const allResultsHref = $derived(url(`/parts/?q=${encodeURIComponent(trimmed)}`));
	const rows = $derived(results.length + (trimmed ? 1 : 0)); // +1 for "see all"

	async function run(query: string) {
		const token = ++latest;
		loading = true;
		try {
			const found = await listParts({ q: query, limit: MAX_SUGGESTIONS, sort: 'name' });
			if (token !== latest) return;
			results = found;
		} catch (e) {
			if (token !== latest) return;
			// A failed lookup must not break typing — the form still submits to
			// /parts, which filters the whole catalogue in the browser.
			console.warn('[search] suggestions unavailable:', e);
			results = [];
		} finally {
			if (token === latest) loading = false;
		}
	}

	function onInput(event: Event) {
		term = (event.currentTarget as HTMLInputElement).value;
		cursor = -1;
		clearTimeout(timer);

		const query = term.trim();
		if (!query) {
			latest++; // abandon any in-flight request
			results = [];
			loading = false;
			open = false;
			return;
		}
		open = true;
		timer = setTimeout(() => run(query), DEBOUNCE_MS);
	}

	function close() {
		open = false;
		cursor = -1;
	}

	function pick(part: Part) {
		close();
		onnavigate?.();
		goto(url(`/parts/${part.slug}`));
	}

	function seeAll() {
		close();
		onnavigate?.();
		goto(allResultsHref);
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			close();
			return;
		}
		if (!open || !rows) {
			if (event.key === 'ArrowDown' && trimmed) open = true;
			return;
		}
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			cursor = cursor + 1 >= rows ? -1 : cursor + 1;
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			cursor = cursor - 1 < -1 ? rows - 1 : cursor - 1;
		} else if (event.key === 'Enter') {
			// -1 means "nothing highlighted": let the form submit to /parts.
			if (cursor === -1) return;
			event.preventDefault();
			if (cursor < results.length) pick(results[cursor]);
			else seeAll();
		}
	}

	/**
	 * Close when focus or a click leaves the whole control. `focusout` alone is
	 * not enough — a mouse-down on a suggestion blurs the input before the click
	 * lands — so the suggestions use `onmousedown` to commit.
	 */
	function onFocusOut(event: FocusEvent) {
		const next = event.relatedTarget as Node | null;
		if (next && root?.contains(next)) return;
		close();
	}
</script>

<svelte:window
	onclick={(e) => {
		if (open && root && !root.contains(e.target as Node)) close();
	}}
/>

<div
	bind:this={root}
	class="relative {block ? 'w-full' : ''} {cls}"
	onfocusout={onFocusOut}
>
	<form
		action={url('/parts/')}
		method="GET"
		role="search"
		onsubmit={() => {
			close();
			onnavigate?.();
		}}
	>
		<div class="relative">
			<span
				class="pointer-events-none absolute inset-y-0 start-3 flex items-center text-slate-400"
			>
				<Icon name="search" size={16} />
			</span>
			<input
				type="search"
				name="q"
				value={term}
				oninput={onInput}
				onkeydown={onKeydown}
				onfocus={() => {
					if (trimmed && (results.length || loading)) open = true;
				}}
				autocomplete="off"
				placeholder={placeholder ?? t('search.placeholder')}
				aria-label={t('search.label')}
				aria-expanded={open}
				aria-controls="search-suggestions"
				role="combobox"
				class="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pe-3 ps-9 text-sm outline-none transition focus:border-abk-blue focus:bg-white {block
					? ''
					: 'md:w-56 md:focus:w-72'}"
			/>
		</div>
	</form>

	{#if open && trimmed}
		<div
			id="search-suggestions"
			role="listbox"
			aria-label={t('search.parts')}
			class="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl {block
				? ''
				: 'md:w-96 md:min-w-full'}"
		>
			{#if results.length}
				<ul class="max-h-[22rem] overflow-y-auto py-1">
					{#each results as part, i (part.id)}
						<li>
							<button
								type="button"
								role="option"
								aria-selected={cursor === i}
								onmousedown={(e) => {
									e.preventDefault();
									pick(part);
								}}
								onmouseenter={() => (cursor = i)}
								class="flex w-full items-center gap-3 px-3 py-2 text-start {cursor === i
									? 'bg-abk-sky'
									: 'hover:bg-slate-50'}"
							>
								<span
									class="h-10 w-10 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-white"
								>
									<PartImage {part} />
								</span>
								<span class="min-w-0 flex-1">
									<span class="block truncate text-sm font-semibold text-slate-800">
										{part.name}
									</span>
									<span dir="ltr" class="block truncate font-mono text-xs text-slate-500">
										{part.part_number}
									</span>
								</span>
								<span
									class="shrink-0 text-[11px] font-bold uppercase tracking-wide text-abk-blue"
								>
									{part.brand.name}
								</span>
							</button>
						</li>
					{/each}
				</ul>
			{:else if loading}
				<p class="px-4 py-6 text-center text-sm text-slate-400">{t('search.searching')}</p>
			{:else}
				<p class="px-4 py-6 text-center text-sm text-slate-500">
					{t('search.noMatches')} “{trimmed}”
				</p>
			{/if}

			<button
				type="button"
				role="option"
				aria-selected={cursor === results.length}
				onmousedown={(e) => {
					e.preventDefault();
					seeAll();
				}}
				onmouseenter={() => (cursor = results.length)}
				class="flex w-full items-center justify-between gap-2 border-t border-slate-100 px-4 py-2.5 text-sm font-semibold text-abk-blue {cursor ===
				results.length
					? 'bg-abk-sky'
					: 'hover:bg-slate-50'}"
			>
				<span class="truncate">{t('search.seeAll')} “{trimmed}”</span>
				<Icon name="arrow" size={16} class="shrink-0 rtl:-scale-x-100" />
			</button>
		</div>
	{/if}
</div>
