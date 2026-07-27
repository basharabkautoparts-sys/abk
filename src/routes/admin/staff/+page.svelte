<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { url } from '$lib/paths';
	import { admin, isRoot } from '$lib/auth.svelte';
	import { addStaff, listStaff, removeStaff, setStaffRole } from '$lib/staff';
	import { resource } from '$lib/resource.svelte';
	import type { StaffMember, StaffRole } from '$lib/types';

	const staff = resource<StaffMember[]>([], listStaff);

	let email = $state('');
	let role = $state<StaffRole>('admin');
	let note = $state('');
	let saving = $state(false);
	let error = $state<string | null>(null);
	let notice = $state<string | null>(null);

	async function add(event: SubmitEvent) {
		event.preventDefault();
		saving = true;
		error = null;
		notice = null;
		try {
			await addStaff(email, role, note, admin.email ?? '');
			notice = `${email.trim().toLowerCase()} can now sign in once their Supabase account exists.`;
			email = '';
			note = '';
			role = 'admin';
			await staff.refresh();
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		} finally {
			saving = false;
		}
	}

	async function changeRole(member: StaffMember, next: StaffRole) {
		error = null;
		notice = null;
		try {
			await setStaffRole(member.email, next);
			await staff.refresh();
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		}
	}

	async function remove(member: StaffMember) {
		if (!confirm(`Remove ${member.email}? They lose access immediately.`)) return;
		error = null;
		notice = null;
		try {
			await removeStaff(member.email);
			await staff.refresh();
			notice = `Removed ${member.email}.`;
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		}
	}
</script>

<Seo title="Staff" canonical="/admin/staff" noindex />

<div class="flex flex-wrap items-center justify-between gap-3">
	<div>
		<h1 class="text-2xl font-black tracking-tight text-slate-800">Staff</h1>
		<p class="text-sm text-slate-500">Who may sign in and manage the catalogue</p>
		<div class="rule-brand mt-2"></div>
	</div>
</div>

{#if !isRoot()}
	<div class="mt-6 rounded-2xl border border-slate-200 bg-white p-8 text-center">
		<div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
			<Icon name="alert" size={24} />
		</div>
		<p class="mt-3 font-semibold text-slate-700">Only a root account can manage staff.</p>
		<p class="mt-1 text-sm text-slate-500">You're signed in as an admin.</p>
	</div>
{:else}
	{#if error}
		<div class="mt-5 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
			<Icon name="alert" size={16} />
			{error}
		</div>
	{/if}
	{#if notice}
		<div class="mt-5 flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-3 text-sm font-medium text-white">
			<Icon name="check" size={16} />
			{notice}
		</div>
	{/if}

	<!-- Add -->
	<form class="mt-6 rounded-2xl border border-slate-200 bg-white p-6" onsubmit={add}>
		<h2 class="text-sm font-bold uppercase tracking-wider text-slate-400">Add someone</h2>
		<div class="mt-4 grid gap-4 sm:grid-cols-[1fr_10rem_1fr_auto] sm:items-end">
			<div>
				<label for="staff-email" class="mb-1 block text-sm font-semibold text-slate-700">Email *</label>
				<input
					id="staff-email"
					type="email"
					required
					bind:value={email}
					placeholder="name@example.com"
					class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-abk-blue"
				/>
			</div>
			<div>
				<label for="staff-role" class="mb-1 block text-sm font-semibold text-slate-700">Role</label>
				<select
					id="staff-role"
					bind:value={role}
					class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-abk-blue"
				>
					<option value="admin">Admin</option>
					<option value="root">Root</option>
				</select>
			</div>
			<div>
				<label for="staff-note" class="mb-1 block text-sm font-semibold text-slate-700"
					>Note <span class="font-normal text-slate-400">(optional)</span></label
				>
				<input
					id="staff-note"
					bind:value={note}
					placeholder="e.g. Sales — Bangkok"
					class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-abk-blue"
				/>
			</div>
			<button
				type="submit"
				disabled={saving}
				class="inline-flex items-center justify-center gap-2 rounded-lg bg-abk-blue px-5 py-2.5 text-sm font-bold text-white transition hover:bg-abk-navy disabled:opacity-60"
			>
				<Icon name="plus" size={16} />
				{saving ? 'Adding…' : 'Add'}
			</button>
		</div>

		<p class="mt-4 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
			<Icon name="alert" size={14} />
			<span>
				<strong>This authorises an email — it does not create the login.</strong>
				Sign-ups are disabled, so also add the person under
				<em>Authentication → Users → Add user</em> in Supabase. Either order works: access
				begins once both exist.
			</span>
		</p>
	</form>

	<!-- List -->
	<div class="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
		{#if staff.loading}
			<div class="py-16 text-center text-sm font-semibold text-slate-400">Loading…</div>
		{:else if staff.error}
			<div class="p-6 text-sm text-red-700">{staff.error}</div>
		{:else}
			<table class="w-full text-left text-sm">
				<thead class="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
					<tr>
						<th class="px-4 py-3 font-semibold">Email</th>
						<th class="hidden px-4 py-3 font-semibold sm:table-cell">Note</th>
						<th class="px-4 py-3 font-semibold">Role</th>
						<th class="px-4 py-3 text-right font-semibold">Actions</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#each staff.value as member (member.email)}
						{@const isSelf = member.email === admin.email?.toLowerCase()}
						<tr class="hover:bg-slate-50">
							<td class="px-4 py-3">
								<span class="font-semibold text-slate-800">{member.email}</span>
								{#if isSelf}
									<span class="ml-2 rounded bg-abk-sky px-2 py-0.5 text-[11px] font-bold text-abk-blue"
										>You</span
									>
								{/if}
							</td>
							<td class="hidden px-4 py-3 text-slate-500 sm:table-cell">{member.note || '—'}</td>
							<td class="px-4 py-3">
								<select
									value={member.role}
									onchange={(e) => changeRole(member, e.currentTarget.value as StaffRole)}
									class="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-semibold outline-none focus:border-abk-blue"
								>
									<option value="admin">Admin</option>
									<option value="root">Root</option>
								</select>
							</td>
							<td class="px-4 py-3 text-right">
								<button
									type="button"
									title="Remove"
									onclick={() => remove(member)}
									class="rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-abk-red"
								>
									<Icon name="trash" size={16} />
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>

	<p class="mt-4 text-xs text-slate-400">
		The database refuses to remove or demote the last root account, so the allowlist cannot be
		locked shut by accident. Removing someone here revokes their access immediately, even while
		they are signed in — but it does not delete their Supabase login. Delete that too if they are
		leaving for good.
	</p>

	<p class="mt-6 text-sm">
		<a href={url('/admin')} class="font-semibold text-abk-blue hover:underline">← Back to dashboard</a>
	</p>
{/if}
