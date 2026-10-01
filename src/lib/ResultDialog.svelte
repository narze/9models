<script lang="ts">
	import Sheet from './Sheet.svelte';
	import { toShareText } from './grid';
	import { my9 } from './store.svelte';

	let { open = $bindable(false), src }: { open?: boolean; src: string } = $props();

	let copyLabel = $state('คัดลอกเป็นข้อความ');

	$effect(() => {
		if (open) copyLabel = 'คัดลอกเป็นข้อความ';
	});

	async function copy() {
		try {
			await navigator.clipboard.writeText(toShareText(my9.slots, my9.caption));
			copyLabel = 'คัดลอกแล้ว';
		} catch {
			copyLabel = 'คัดลอกไม่ได้ ลองกดค้างที่รูปแทน';
		}
	}
</script>

<Sheet bind:open title="รูปของคุณ" label="รูปสำหรับแชร์">
	<div class="resultbox">
		<img {src} alt="ตาราง My9Models ของคุณ" />
		<p>กดค้างที่รูปเพื่อบันทึก แล้วโพสต์พร้อม #My9Models</p>
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- data URL download, not navigation -->
		<a class="btn" href={src} download="my9models.png">ดาวน์โหลดรูป</a>
		<button class="btn" onclick={copy}>{copyLabel}</button>
	</div>
</Sheet>

<style>
	.resultbox {
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 12px;
		align-items: center;
		overflow-y: auto;
	}
	img {
		width: 100%;
		height: auto;
		border: 2px solid var(--line);
		border-radius: 10px;
	}
	p {
		margin: 0;
		color: var(--muted);
		font-size: 0.88rem;
		text-align: center;
	}
	a.btn {
		text-decoration: none;
	}
</style>
