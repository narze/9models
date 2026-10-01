<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		open = $bindable(false),
		title,
		label,
		children
	}: { open?: boolean; title: string; label: string; children: Snippet } = $props();

	let dialog: HTMLDialogElement;

	$effect(() => {
		if (open && !dialog.open) dialog.showModal();
		else if (!open && dialog.open) dialog.close();
	});
</script>

<dialog
	bind:this={dialog}
	aria-label={label}
	onclose={() => (open = false)}
	onclick={(e) => e.target === dialog && (open = false)}
>
	<div class="sheet">
		<header>
			<h2>{title}</h2>
			<button class="x" aria-label="ปิด" onclick={() => (open = false)}>×</button>
		</header>
		{@render children()}
	</div>
</dialog>

<style>
	dialog {
		border: 2px solid var(--line);
		border-radius: 16px 16px 0 0;
		padding: 0;
		width: min(100%, 560px);
		max-width: 100%;
		max-height: 82dvh;
		margin: auto auto 0;
		background: var(--paper);
		color: var(--ink);
	}
	dialog::backdrop {
		background: rgba(10, 16, 22, 0.55);
	}
	.sheet {
		display: flex;
		flex-direction: column;
		max-height: 82dvh;
	}
	header {
		padding: 14px 16px 8px;
		display: flex;
		gap: 8px;
		align-items: center;
	}
	h2 {
		margin: 0;
		font-size: 1.05rem;
		flex: 1;
	}
	.x {
		background: none;
		border: 0;
		color: var(--ink);
		font-size: 1.6rem;
		line-height: 1;
		cursor: pointer;
		padding: 4px 8px;
	}
</style>
