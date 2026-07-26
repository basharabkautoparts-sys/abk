import { onMount } from 'svelte';

export interface Resource<T> {
	value: T;
	loading: boolean;
	error: string | null;
	refresh: () => Promise<void>;
}

/**
 * Data fetched in the browser after mount. The admin has no server loads — the
 * pages are prerendered as empty shells and fill themselves in once the staff
 * session is available.
 */
export function resource<T>(initial: T, fetcher: () => Promise<T>): Resource<T> {
	const self: Resource<T> = $state({
		value: initial,
		loading: true,
		error: null,
		async refresh() {
			self.loading = true;
			try {
				self.value = await fetcher();
				self.error = null;
			} catch (e) {
				self.error = e instanceof Error ? e.message : String(e);
			} finally {
				self.loading = false;
			}
		}
	});

	onMount(() => {
		self.refresh();
	});

	return self;
}
