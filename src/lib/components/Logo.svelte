<script lang="ts">
	import { site } from '$lib/config';
	interface Props {
		height?: number;
		class?: string;
	}
	let { height = 46, class: cls = '' }: Props = $props();
</script>

<img
	src="/logo.png"
	alt={site.name}
	width={Math.round(height * 2.12)}
	height={height}
	style="height: {height}px; width: auto;"
	class={cls}
	decoding="async"
/>
