<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { url } from '$lib/paths';
	import { admin, isRoot } from '$lib/auth.svelte';
	import { addStaff, listStaff, removeStaff, setPassword, setStaffRole } from '$lib/staff';
	import { resource } from '$lib/resource.svelte';
	import type { StaffMember, StaffRole } from '$lib/types';

	const staff = resource<StaffMember[]>([], listStaff);

	let email = $state('');
	let password = $state('');
	let role = $state<StaffRole>('admin');
	let note = $state('');
	let saving = $state(false);
	let error = $state<string | null>(null);
	let notice = $state<string | null>(null);

	// Which member's inline "set password" editor is open, if any.
	let pwTarget = $state<string | null>(null);
	let pwValue = $state('');
	let pwSaving = $state(false);

	async function add(event: SubmitEvent) {
		event.preventDefault();
		saving = true;
		error = null;
		notice = null;
		const clean = email.trim().toLowerCase();
		try {
			await addStaff(clean, role, note, admin.email ?? '');
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
			saving = false;
			return;
		}
		if (password) {
			try {
				await setPassword(clean, password);
				notice = `${clean} was added and can sign in now.`;
			} catch (e) {
				// The allowlist entry stuck; only the login failed. Point at the
				// retry path instead of leaving a half-done state unexplained.
				const reason = e instanceof Error ? e.message : String(e);
				error = `${clean} is on the list, but creating their login failed: ${reason} Use the key button on their row to retry.`;
			}
		} else {
			notice = `${clean} can now sign in once their Supabase account exists.`;
		}
		email = '';
		password = '';
		note = '';
		role = 'admin';
		await staff.refresh();
		saving = false;
	}

	function openPassword(member: StaffMember) {
		pwTarget = pwTarget === member.email ? null : member.email;
		pwValue = '';
		error = null;
		notice = null;
	}

	async function savePassword(event: SubmitEvent) {
		event.preventDefault();
		if (!pwTarget) return;
		pwSaving = true;
		error = null;
		notice = null;
		try {
			const { created } = await setPassword(pwTarget, pwValue);
			notice = created
				? `Login created — ${pwTarget} can sign in now.`
				: `Password updated for ${pwTarget}.`;
			pwTarget = null;
			pwValue = '';
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		} finally {
			pwSaving = false;
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
		<div class="mt-4 grid gap-4 sm:grid-cols-2 sm:items-end lg:grid-cols-[1fr_1fr_9rem_1fr_auto]">
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
				<label for="staff-password" class="mb-1 block text-sm font-semibold text-slate-700"
					>Password <span class="font-normal text-slate-400">(optional)</span></label
				>
				<input
					id="staff-password"
					type="password"
					minlength="8"
					autocomplete="new-password"
					bind:value={password}
					placeholder="min. 8 characters"
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
				<strong>With a password, this creates the login too</strong> — the person can sign in
				straight away. Leave it blank to only authorise the email; the login must then be
				created later with the <Icon name="key" size={12} /> button on their row (or under
				<em>Authentication → Users</em> in Supabase).
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
									title="Set password"
									onclick={() => openPassword(member)}
									class="rounded-md p-2 text-slate-400 hover:bg-abk-sky hover:text-abk-blue"
									class:text-abk-blue={pwTarget === member.email}
								>
									<Icon name="key" size={16} />
								</button>
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
						{#if pwTarget === member.email}
							<tr class="bg-slate-50">
								<td colspan="4" class="px-4 py-3">
									<form class="flex flex-wrap items-center gap-3" onsubmit={savePassword}>
										<label for="staff-set-password" class="text-xs font-semibold text-slate-600">
											New password for {member.email}
										</label>
										<input
											id="staff-set-password"
											type="password"
											required
											minlength="8"
											autocomplete="new-password"
											bind:value={pwValue}
											placeholder="min. 8 characters"
											class="w-56 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-abk-blue"
										/>
										<button
											type="submit"
											disabled={pwSaving}
											class="rounded-lg bg-abk-blue px-4 py-2 text-xs font-bold text-white transition hover:bg-abk-navy disabled:opacity-60"
										>
											{pwSaving ? 'Saving…' : 'Save'}
										</button>
										<button
											type="button"
											onclick={() => (pwTarget = null)}
											class="text-xs font-semibold text-slate-500 hover:text-slate-700"
										>
											Cancel
										</button>
										<span class="text-xs text-slate-400">
											Creates the login if it doesn't exist yet; resets the password if it does.
										</span>
									</form>
								</td>
							</tr>
						{/if}
					{/each}
				</tbody>
			</table>
		{/if}
	</div>

	<p class="mt-4 text-xs text-slate-400">
		The database refuses to remove or demote the last root account, so the allowlist cannot be
		locked shut by accident. The key button sets someone's password — creating their login if it
		doesn't exist yet — which is also how to help anyone who has forgotten theirs. Removing
		someone here revokes their access immediately, even while they are signed in — but it does
		not delete their Supabase login. Delete that too if they are leaving for good.
	</p>

	<p class="mt-6 text-sm">
		<a href={url('/admin')} class="font-semibold text-abk-blue hover:underline">← Back to dashboard</a>
	</p>
{/if}
