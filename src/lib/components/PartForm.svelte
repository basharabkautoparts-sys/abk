<script lang="ts">
	import { untrack } from 'svelte';
	import { brands, categories } from '$lib/config';
	import type { PartFormValues } from '$lib/partForm';
	import Icon from './Icon.svelte';

	interface Props {
		values: PartFormValues;
		submitLabel: string;
		demoMode?: boolean;
		/**
		 * Persist the submission. Return a map of field errors to display
		 * (`_` for a form-level message), or nothing on success.
		 */
		save: (form: FormData) => Promise<Record<string, string> | void>;
	}
	let { values, submitLabel, demoMode = false, save }: Props = $props();

	// Seed the editable image list once from the incoming values. The parent
	// keys this component by part id, so switching parts re-initialises it.
	let images = $state<string[]>(untrack(() => [...values.images]));
	let newUrl = $state('');
	let saving = $state(false);
	let errors = $state<Record<string, string>>({});

	function addUrl() {
		const u = newUrl.trim();
		if (u && !images.includes(u)) images = [...images, u];
		newUrl = '';
	}
	function removeImage(i: number) {
		images = images.filter((_, idx) => idx !== i);
	}

	const conditions = ['Genuine', 'OEM', 'Aftermarket'];
	const fieldError = (k: string) => errors[k];

	async function onsubmit(event: SubmitEvent) {
		event.preventDefault();
		saving = true;
		errors = {};
		try {
			const result = await save(new FormData(event.currentTarget as HTMLFormElement));
			if (result) errors = result;
		} catch (e) {
			errors = { _: e instanceof Error ? e.message : String(e) };
		} finally {
			saving = false;
		}
	}
</script>

<form enctype="multipart/form-data" class="space-y-6" {onsubmit}>
	<!-- Hidden inputs carry the current image URL list through the submission -->
	{#each images as img}
		<input type="hidden" name="images" value={img} />
	{/each}

	{#if fieldError('_')}
		<div
			class="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
		>
			<Icon name="alert" size={16} />
			{fieldError('_')}
		</div>
	{/if}

	<div class="rounded-2xl border border-slate-200 bg-white p-6">
		<h2 class="text-sm font-bold uppercase tracking-wider text-slate-400">Details</h2>
		<div class="mt-4 grid gap-4 sm:grid-cols-2">
			<div class="sm:col-span-2">
				<label for="name" class="mb-1 block text-sm font-semibold text-slate-700">Part name *</label>
				<input
					id="name"
					name="name"
					value={values.name}
					required
					placeholder="e.g. Front Brake Disc Rotor — Hilux Revo"
					class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-abk-blue"
				/>
				{#if fieldError('name')}<p class="mt-1 text-xs text-red-600">{fieldError('name')}</p>{/if}
			</div>

			<div>
				<label for="part_number" class="mb-1 block text-sm font-semibold text-slate-700"
					>Part number *</label
				>
				<input
					id="part_number"
					name="part_number"
					value={values.part_number}
					required
					placeholder="43512-0K060"
					class="w-full rounded-lg border border-slate-300 px-3 py-2.5 font-mono text-sm outline-none focus:border-abk-blue"
				/>
				{#if fieldError('part_number')}<p class="mt-1 text-xs text-red-600">
						{fieldError('part_number')}
					</p>{/if}
			</div>

			<div>
				<label for="oem" class="mb-1 block text-sm font-semibold text-slate-700"
					>OEM / reference <span class="font-normal text-slate-400">(optional)</span></label
				>
				<input
					id="oem"
					name="oem"
					value={values.oem}
					placeholder="Cross-reference number"
					class="w-full rounded-lg border border-slate-300 px-3 py-2.5 font-mono text-sm outline-none focus:border-abk-blue"
				/>
			</div>

			<div>
				<label for="category_slug" class="mb-1 block text-sm font-semibold text-slate-700"
					>Category *</label
				>
				<select
					id="category_slug"
					name="category_slug"
					class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-abk-blue"
				>
					<option value="" disabled selected={!values.category_slug}>Select a category…</option>
					{#each categories as cat}
						<option value={cat.slug} selected={values.category_slug === cat.slug}>{cat.name}</option>
					{/each}
				</select>
				{#if fieldError('category_slug')}<p class="mt-1 text-xs text-red-600">
						{fieldError('category_slug')}
					</p>{/if}
			</div>

			<div>
				<label for="brand_slug" class="mb-1 block text-sm font-semibold text-slate-700"
					>Vehicle brand *</label
				>
				<select
					id="brand_slug"
					name="brand_slug"
					class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-abk-blue"
				>
					<option value="" disabled selected={!values.brand_slug}>Select a brand…</option>
					{#each brands as brand}
						<option value={brand.slug} selected={values.brand_slug === brand.slug}>{brand.name}</option
						>
					{/each}
				</select>
				{#if fieldError('brand_slug')}<p class="mt-1 text-xs text-red-600">
						{fieldError('brand_slug')}
					</p>{/if}
			</div>

			<div>
				<label for="price" class="mb-1 block text-sm font-semibold text-slate-700"
					>Price (THB) <span class="font-normal text-slate-400">(blank = on request)</span></label
				>
				<input
					id="price"
					name="price"
					type="number"
					min="0"
					step="1"
					value={values.price}
					placeholder="1850"
					class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-abk-blue"
				/>
				{#if fieldError('price')}<p class="mt-1 text-xs text-red-600">{fieldError('price')}</p>{/if}
			</div>

			<div>
				<label for="condition" class="mb-1 block text-sm font-semibold text-slate-700">Condition</label
				>
				<select
					id="condition"
					name="condition"
					class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-abk-blue"
				>
					{#each conditions as c}
						<option value={c} selected={values.condition === c}>{c}</option>
					{/each}
				</select>
			</div>

			<div class="sm:col-span-2">
				<label for="description" class="mb-1 block text-sm font-semibold text-slate-700"
					>Description</label
				>
				<textarea
					id="description"
					name="description"
					rows="4"
					placeholder="Fitment notes, features, compatible models…"
					class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-abk-blue"
					>{values.description}</textarea
				>
			</div>
		</div>
	</div>

	<!-- Images -->
	<div class="rounded-2xl border border-slate-200 bg-white p-6">
		<h2 class="text-sm font-bold uppercase tracking-wider text-slate-400">Images</h2>

		{#if images.length}
			<div class="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
				{#each images as img, i}
					<div class="group relative aspect-square overflow-hidden rounded-lg border border-slate-200">
						<img src={img} alt="" class="h-full w-full object-cover" />
						<button
							type="button"
							onclick={() => removeImage(i)}
							class="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100"
							aria-label="Remove image"
						>
							<Icon name="close" size={14} />
						</button>
					</div>
				{/each}
			</div>
		{:else}
			<p class="mt-3 text-sm text-slate-400">
				No images yet. The card will show a branded placeholder.
			</p>
		{/if}

		<div class="mt-4 flex gap-2">
			<input
				type="url"
				bind:value={newUrl}
				placeholder="Paste an image URL…"
				onkeydown={(e) => {
					if (e.key === 'Enter') {
						e.preventDefault();
						addUrl();
					}
				}}
				class="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-abk-blue"
			/>
			<button
				type="button"
				onclick={addUrl}
				class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-abk-blue hover:text-abk-blue"
			>
				Add URL
			</button>
		</div>

		{#if demoMode}
			<p class="mt-3 flex items-center gap-1.5 text-xs text-amber-700">
				<Icon name="alert" size={14} /> File upload needs Supabase Storage. In demo mode, add image URLs
				instead.
			</p>
		{:else}
			<div class="mt-3">
				<label for="files" class="mb-1 block text-sm font-semibold text-slate-700"
					>Or upload files</label
				>
				<input
					id="files"
					name="files"
					type="file"
					accept="image/*"
					multiple
					class="block w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-abk-sky file:px-4 file:py-2 file:text-sm file:font-semibold file:text-abk-blue hover:file:bg-blue-100"
				/>
			</div>
		{/if}
		{#if fieldError('images')}<p class="mt-2 text-xs text-red-600">{fieldError('images')}</p>{/if}
	</div>

	<!-- Flags -->
	<div class="rounded-2xl border border-slate-200 bg-white p-6">
		<h2 class="text-sm font-bold uppercase tracking-wider text-slate-400">Visibility</h2>
		<div class="mt-4 space-y-3">
			<label class="flex items-center gap-3 text-sm">
				<input
					type="checkbox"
					name="published"
					checked={values.published}
					class="h-4 w-4 accent-abk-blue"
				/>
				<span
					><span class="font-semibold text-slate-700">Published</span> — visible on the public site</span
				>
			</label>
			<label class="flex items-center gap-3 text-sm">
				<input
					type="checkbox"
					name="in_stock"
					checked={values.in_stock}
					class="h-4 w-4 accent-abk-blue"
				/>
				<span
					><span class="font-semibold text-slate-700">In stock</span> — otherwise shown as backorder</span
				>
			</label>
			<label class="flex items-center gap-3 text-sm">
				<input
					type="checkbox"
					name="featured"
					checked={values.featured}
					class="h-4 w-4 accent-abk-blue"
				/>
				<span
					><span class="font-semibold text-slate-700">Featured</span> — highlighted on the homepage</span
				>
			</label>
		</div>
	</div>

	<div class="flex items-center gap-3">
		<button
			type="submit"
			disabled={saving}
			class="inline-flex items-center gap-2 rounded-lg bg-abk-blue px-6 py-2.5 text-sm font-bold text-white transition hover:bg-abk-navy disabled:opacity-60"
		>
			<Icon name="check" size={16} />
			{saving ? 'Saving…' : submitLabel}
		</button>
		<a
			href="/admin/parts"
			class="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-800">Cancel</a
		>
	</div>
</form>
