<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
</script>

<div class="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
	<h1 class="text-xl font-black text-slate-800">Sign out of the admin?</h1>
	<form method="POST" class="mt-6 flex justify-center gap-3">
		<a href="/admin" class="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-700">Cancel</a>
		<button
			type="submit"
			class="inline-flex items-center gap-2 rounded-lg bg-abk-red px-5 py-2.5 text-sm font-bold text-white hover:bg-abk-red-dark"
		>
			<Icon name="logout" size={16} /> Sign out
		</button>
	</form>
</div>
