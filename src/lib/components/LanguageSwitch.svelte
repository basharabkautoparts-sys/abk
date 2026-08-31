<script lang="ts">
	import { LANGS, LANG_LABELS, LANG_SHORT, i18n, setLang, t } from '$lib/i18n.svelte';

	interface Props {
		/** Stretch to fill its container — used in the mobile menu. */
		block?: boolean;
		class?: string;
	}
	let { block = false, class: cls = '' }: Props = $props();
</script>

<div
	class="inline-flex items-center rounded-full border border-slate-200 p-0.5 {block
		? 'w-full'
		: ''} {cls}"
	role="group"
	aria-label={t('nav.language')}
>
	{#each LANGS as lang}
		<button
			type="button"
			onclick={() => setLang(lang)}
			lang={lang}
			aria-pressed={i18n.lang === lang}
			title={LANG_LABELS[lang]}
			class="rounded-full px-3 py-1 text-xs font-bold transition {block ? 'flex-1' : ''} {i18n.lang ===
			lang
				? 'bg-abk-blue text-white'
				: 'text-slate-600 hover:text-abk-blue'}"
		>
			{LANG_SHORT[lang]}
			<span class="sr-only">{LANG_LABELS[lang]}</span>
		</button>
	{/each}
</div>
