<script lang="ts">
	import type { Slot } from './grid';
	import { labColor } from './models';

	let {
		slot,
		rank,
		popped = false,
		onclick
	}: { slot: Slot | null; rank: number; popped?: boolean; onclick: () => void } = $props();
</script>

<li>
	<button
		class="slot"
		class:empty={!slot}
		class:pop={popped}
		aria-label={slot ? `อันดับ ${rank}: ${slot.name}` : `ช่อง ${rank} ว่าง`}
		{onclick}
	>
		{#if slot}
			<div class="art" style:background-color={labColor(slot.lab)}>
				<span class="rank">{rank}</span>
				<span class="big">{slot.name}</span>
			</div>
			<p class="tag">{slot.name}</p>
		{:else}
			<span class="plus">+</span>
			<span class="lbl">ช่อง {rank}</span>
		{/if}
	</button>
</li>

<style>
	li {
		display: contents;
	}
	.slot {
		width: 100%;
		position: relative;
		aspect-ratio: 3 / 4;
		padding: 0;
		cursor: pointer;
		border: 2px solid var(--line);
		border-radius: 12px;
		overflow: hidden;
		background: var(--empty);
		color: inherit;
		font: inherit;
		text-align: left;
		box-shadow: 3px 3px 0 var(--shadow);
		display: flex;
		flex-direction: column;
	}
	.slot:active {
		transform: translate(2px, 2px);
		box-shadow: 1px 1px 0 var(--shadow);
	}
	.empty {
		border-style: dashed;
		box-shadow: none;
		align-items: center;
		justify-content: center;
		color: var(--muted);
		gap: 4px;
	}
	.plus {
		font-family: 'Bricolage Grotesque', sans-serif;
		font-size: 2rem;
		font-weight: 500;
		line-height: 1;
	}
	.lbl {
		font-size: 0.78rem;
	}
	.art {
		flex: 1;
		position: relative;
		color: #fff;
		padding: 10px 9px;
		display: flex;
		align-items: flex-end;
		background-image: radial-gradient(
			circle at 1px 1px,
			rgba(255, 255, 255, 0.22) 1.2px,
			transparent 1.6px
		);
		background-size: 11px 11px;
	}
	.big {
		font-family: 'Bricolage Grotesque', sans-serif;
		font-weight: 800;
		font-size: clamp(1.15rem, 6.2vw, 1.9rem);
		line-height: 0.95;
		letter-spacing: -0.03em;
		overflow-wrap: anywhere;
		text-shadow: 0 1px 0 rgba(0, 0, 0, 0.18);
	}
	.rank {
		position: absolute;
		top: 6px;
		right: 8px;
		font-size: 0.7rem;
		font-weight: 600;
		background: rgba(0, 0, 0, 0.28);
		border-radius: 99px;
		padding: 0 7px;
	}
	.tag {
		background: var(--paper);
		color: var(--ink);
		border-top: 2px solid var(--line);
		font-size: 0.68rem;
		font-weight: 600;
		padding: 5px 7px;
		margin: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	@media (prefers-reduced-motion: no-preference) {
		.pop .art {
			animation: pop 0.28s ease-out;
		}
		@keyframes pop {
			from {
				transform: scale(0.9);
				opacity: 0.4;
			}
			to {
				transform: none;
				opacity: 1;
			}
		}
	}
</style>
