<script lang="ts">
	import Sheet from './Sheet.svelte';
	import { filterModels, isTaken } from './grid';
	import { labColor } from './models';
	import { my9 } from './store.svelte';

	let { index = $bindable<number | null>(null) }: { index?: number | null } = $props();

	let query = $state('');
	let own = $state('');
	let ownPlaceholder = $state('ไม่มีในลิสต์? พิมพ์ชื่อเอง');
	let open = $state(false);
	let active = $state(0);

	// Open when a slot index arrives from the parent; reset when the sheet closes.
	$effect(() => {
		if (index !== null && !open) {
			active = index;
			query = '';
			own = '';
			ownPlaceholder = 'ไม่มีในลิสต์? พิมพ์ชื่อเอง';
			open = true;
		}
	});
	$effect(() => {
		if (!open) index = null;
	});

	const groups = $derived(filterModels(query));
	const current = $derived(my9.slots[active]);

	function choose(name: string) {
		my9.set(active, name);
		open = false;
	}

	function addOwn() {
		const v = own.trim();
		if (!v) return;
		if (isTaken(my9.slots, v, active)) {
			own = '';
			ownPlaceholder = 'ชื่อนี้ถูกเลือกไปแล้ว';
			return;
		}
		choose(v);
	}
</script>

<Sheet bind:open title={`อันดับ ${active + 1}`} label="เลือก model">
	<input
		class="search"
		type="search"
		placeholder="ค้นหา เช่น claude, gpt, llama"
		autocomplete="off"
		bind:value={query}
	/>
	<div class="list">
		{#each groups as [lab, models] (lab)}
			<div class="group">{lab}</div>
			<div class="opts">
				{#each models as m (m)}
					<button
						class="opt"
						style:background={labColor(lab)}
						disabled={isTaken(my9.slots, m, active)}
						onclick={() => choose(m)}>{m}</button
					>
				{/each}
			</div>
		{:else}
			<p class="group">ไม่เจอในลิสต์ ลองพิมพ์ชื่อเองด้านล่าง</p>
		{/each}
	</div>
	<form
		class="custom"
		onsubmit={(e) => {
			e.preventDefault();
			addOwn();
		}}
	>
		<input placeholder={ownPlaceholder} maxlength="28" bind:value={own} />
		<button class="btn" type="submit">ใช้ชื่อนี้</button>
	</form>
	{#if current}
		<div class="remove">
			<button
				class="btn"
				onclick={() => {
					my9.set(active, null);
					open = false;
				}}>เอาออกจากช่องนี้</button
			>
		</div>
	{/if}
</Sheet>

<style>
	.search {
		margin: 0 16px 8px;
		font: inherit;
		color: var(--ink);
		background: var(--bg);
		border: 2px solid var(--line);
		border-radius: 10px;
		padding: 9px 12px;
		width: calc(100% - 32px);
	}
	.list {
		overflow-y: auto;
		padding: 0 16px 16px;
	}
	.group {
		font-size: 0.78rem;
		color: var(--muted);
		font-weight: 600;
		margin: 12px 0 6px;
	}
	.opts {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.opt {
		font: inherit;
		font-size: 0.9rem;
		cursor: pointer;
		color: #fff;
		font-weight: 600;
		border: 2px solid var(--line);
		border-radius: 99px;
		padding: 6px 13px;
	}
	.opt[disabled] {
		opacity: 0.3;
		cursor: not-allowed;
		text-decoration: line-through;
	}
	.custom {
		display: flex;
		gap: 8px;
		margin: 14px 16px 16px;
	}
	.custom input {
		flex: 1;
		min-width: 0;
		font: inherit;
		color: var(--ink);
		background: var(--bg);
		border: 2px solid var(--line);
		border-radius: 10px;
		padding: 9px 12px;
	}
	.remove {
		margin: 0 16px 16px;
	}
</style>
