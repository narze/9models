<script lang="ts">
	import Sheet from './Sheet.svelte';

	let { open = $bindable(false), src }: { open?: boolean; src: string } = $props();

	let copyLabel = $state('คัดลอกภาพ');

	$effect(() => {
		if (open) copyLabel = 'คัดลอกภาพ';
	});

	async function copy() {
		try {
			const blob = await (await fetch(src)).blob();
			await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
			copyLabel = 'คัดลอกแล้ว';
		} catch {
			copyLabel = 'คัดลอกไม่ได้ ลองกดค้างที่ภาพแทน';
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
