<script lang="ts">
	import Picker from '$lib/Picker.svelte';
	import ResultDialog from '$lib/ResultDialog.svelte';
	import Slot from '$lib/Slot.svelte';
	import { makeImage } from '$lib/exportImage';
	import { my9 } from '$lib/store.svelte';

	let picking = $state<number | null>(null);
	let popped = $state(-1);
	let resultOpen = $state(false);
	let resultSrc = $state('');

	// Flash the animation on the slot that just changed.
	let prev = $state.raw(my9.slots);
	$effect(() => {
		const next = my9.slots;
		const i = next.findIndex((s, k) => s && s !== prev[k] && s.name !== prev[k]?.name);
		prev = next;
		popped = i;
	});

	async function makeShare() {
		resultSrc = await makeImage(my9.slots, my9.caption);
		resultOpen = true;
	}

	function reset() {
		if (my9.count && !confirm('ล้างทั้ง 9 ช่อง?')) return;
		my9.clear();
	}
</script>

<svelte:head>
	<title>My9Models - เลือก 9 AI model ที่ใช่</title>
	<meta
		name="description"
		content="เลือก AI model 9 ตัวที่คุณใช้จริง จัดอันดับแล้วแชร์ได้เลย #My9Models"
	/>
</svelte:head>

<main class="wrap">
	<h1><span class="hash">#</span>My9Models</h1>
	<p class="sub">
		เลือก AI model 9 ตัวที่คุณใช้จริง ตัวไหนเปลี่ยนชีวิต ตัวไหนอยู่กับคุณมานาน
		จัดอันดับแล้วแชร์ได้เลย
	</p>

	<textarea
		class="caption"
		aria-label="แคปชั่น"
		placeholder="เล่าหน่อย… ใช้ตัวไหนบ่อยสุด เพราะอะไร"
		bind:value={my9.caption}
		oninput={() => my9.save()}></textarea>

	<ul class="grid">
		{#each my9.slots as slot, i (i)}
			<Slot {slot} rank={i + 1} popped={popped === i} onclick={() => (picking = i)} />
		{/each}
	</ul>

	<div class="bar">
		<button class="btn primary" disabled={my9.count === 0} onclick={makeShare}>
			สร้างรูปเพื่อแชร์
		</button>
		<button class="btn" onclick={reset}>ล้างทั้งหมด</button>
	</div>
	<p class="hint">
		รายชื่อ model อ้างอิงจาก registry ของ RubyLLM
		ไม่มีในลิสต์ก็พิมพ์ชื่อเองได้
	</p>
	<p class="hint">เลือกแล้ว {my9.count}/9 · แตะช่องเพื่อเลือก model</p>
</main>

<Picker bind:index={picking} />
<ResultDialog bind:open={resultOpen} src={resultSrc} />

<style>
	.wrap {
		max-width: 560px;
		margin: 0 auto;
		padding: 20px 16px 48px;
	}
	h1 {
		font-family: 'Bricolage Grotesque', 'Noto Sans Thai', sans-serif;
		font-weight: 800;
		font-size: clamp(2.2rem, 9vw, 3.2rem);
		letter-spacing: -0.03em;
		line-height: 1;
		margin: 8px 0 6px;
	}
	.hash {
		color: var(--accent);
	}
	.sub {
		color: var(--muted);
		margin: 0 0 16px;
		max-width: 46ch;
	}
	.caption {
		width: 100%;
		resize: none;
		min-height: 84px;
		background: var(--paper);
		color: var(--ink);
		border: 2px solid var(--line);
		border-radius: 10px;
		padding: 10px 12px;
		font: inherit;
		margin-bottom: 16px;
	}
	.grid {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 10px;
	}
	.bar {
		display: flex;
		gap: 10px;
		margin-top: 20px;
		flex-wrap: wrap;
	}
	.hint {
		font-size: 0.85rem;
		color: var(--muted);
		margin-top: 14px;
	}
</style>
