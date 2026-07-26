<script lang="ts">
	import { url } from '$lib/paths';
	import { page } from '$app/state';
	import Icon from '$lib/components/Icon.svelte';
</script>

<div class="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
	<p class="text-7xl font-black text-abk-blue">{page.status}</p>
	<h1 class="mt-4 text-2xl font-black tracking-tight text-slate-800">
		{page.status === 404 ? 'Part or page not found' : (page.error?.message ?? 'Something went wrong')}
	</h1>
	<p class="mt-2 max-w-md text-slate-500">
		{page.status === 404
			? "The page you're looking for doesn't exist. Try browsing our catalogue instead."
			: 'Please try again, or contact us if the problem continues.'}
	</p>
	<div class="mt-8 flex flex-wrap justify-center gap-3">
		<a
			href={url('/')}
			class="inline-flex items-center gap-2 rounded-full bg-abk-blue px-6 py-3 text-sm font-bold text-white transition hover:bg-abk-navy"
		>
			<Icon name="arrow" size={16} class="rotate-180" /> Back home
		</a>
		<a
			href={url('/parts')}
			class="inline-flex items-center gap-2 rounded-full border border-slate-300 px-6 py-3 text-sm font-bold text-slate-700 transition hover:border-abk-blue hover:text-abk-blue"
		>
			Browse parts
		</a>
	</div>
</div>
