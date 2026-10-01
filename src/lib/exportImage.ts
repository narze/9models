import type { Slots } from './grid';
import { labColor } from './models';

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
	const words = text.split(/(\s+)/);
	const lines: string[] = [];
	let cur = '';
	for (const w of words) {
		if (ctx.measureText(cur + w).width > maxW && cur.trim()) {
			lines.push(cur.trim());
			cur = w.trimStart();
		} else cur += w;
	}
	if (cur.trim()) lines.push(cur.trim());
	return lines;
}

function roundRect(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	w: number,
	h: number,
	r: number
) {
	ctx.beginPath();
	ctx.roundRect(x, y, w, h, r);
}

export async function makeImage(slots: Slots, caption: string): Promise<string> {
	try {
		await document.fonts.ready;
	} catch {
		/* fonts API unavailable */
	}
	const W = 1080;
	const pad = 48;
	const gap = 24;
	const cols = 3;
	const cw = (W - pad * 2 - gap * 2) / 3;
	const ch = (cw * 4) / 3;
	const ink = '#16202b';
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d')!;
	const body = '"Noto Sans Thai", sans-serif';
	const display = '"Bricolage Grotesque", sans-serif';

	ctx.font = `500 34px ${body}`;
	const cap = caption.trim();
	const capLines = cap ? wrapText(ctx, cap, W - pad * 2).slice(0, 4) : [];
	const headH = 150 + capLines.length * 48 + (capLines.length ? 16 : 0);
	canvas.width = W;
	canvas.height = headH + 3 * ch + 2 * gap + pad + 50;

	ctx.fillStyle = '#e4ecf2';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.textBaseline = 'alphabetic';
	ctx.font = `800 84px ${display}`;
	ctx.fillStyle = '#ff5a36';
	ctx.fillText('#', pad, 108);
	const hashW = ctx.measureText('#').width;
	ctx.fillStyle = ink;
	ctx.fillText('My9Models', pad + hashW, 108);
	ctx.font = `500 34px ${body}`;
	capLines.forEach((l, i) => ctx.fillText(l, pad, 168 + i * 48));

	slots.forEach((s, i) => {
		const x = pad + (i % cols) * (cw + gap);
		const y = headH + Math.floor(i / cols) * (ch + gap);
		ctx.save();
		ctx.fillStyle = ink;
		roundRect(ctx, x + 6, y + 6, cw, ch, 22);
		ctx.fill();
		ctx.fillStyle = s ? labColor(s.lab) : '#d3dee8';
		roundRect(ctx, x, y, cw, ch, 22);
		ctx.fill();
		ctx.clip();
		if (s) {
			ctx.fillStyle = 'rgba(255,255,255,.22)';
			for (let dx = 12; dx < cw; dx += 22)
				for (let dy = 12; dy < ch; dy += 22) {
					ctx.beginPath();
					ctx.arc(x + dx, y + dy, 2.2, 0, 7);
					ctx.fill();
				}
			const tagH = 62;
			ctx.fillStyle = '#f7fafc';
			ctx.fillRect(x, y + ch - tagH, cw, tagH);
			ctx.fillStyle = ink;
			ctx.fillRect(x, y + ch - tagH - 3, cw, 3);

			let fs = 56;
			let lines: string[];
			do {
				ctx.font = `800 ${fs}px ${display}`;
				lines = wrapText(ctx, s.name, cw - 40);
				fs -= 4;
			} while (
				(lines.length > 3 || lines.some((l) => ctx.measureText(l).width > cw - 40)) &&
				fs > 24
			);
			ctx.fillStyle = '#fff';
			const lh = fs * 1.02 + 4;
			const baseY = y + ch - tagH - 26;
			lines.reverse().forEach((l, k) => ctx.fillText(l, x + 20, baseY - k * lh));

			ctx.font = `600 24px ${body}`;
			ctx.fillStyle = ink;
			let t = s.name;
			while (ctx.measureText(t).width > cw - 32 && t.length > 3) t = t.slice(0, -2);
			ctx.fillText(t === s.name ? t : t + '…', x + 16, y + ch - 22);

			ctx.fillStyle = 'rgba(0,0,0,.3)';
			roundRect(ctx, x + cw - 58, y + 14, 44, 34, 17);
			ctx.fill();
			ctx.fillStyle = '#fff';
			ctx.font = `600 22px ${body}`;
			ctx.textAlign = 'center';
			ctx.fillText(String(i + 1), x + cw - 36, y + 38);
			ctx.textAlign = 'left';
		}
		ctx.restore();
		ctx.lineWidth = 4;
		ctx.strokeStyle = ink;
		if (!s) ctx.setLineDash([12, 10]);
		roundRect(ctx, x, y, cw, ch, 22);
		ctx.stroke();
		ctx.setLineDash([]);
	});

	ctx.font = `500 26px ${body}`;
	ctx.fillStyle = '#5d6c7b';
	ctx.fillText('สร้างของคุณได้ที่ 9models.narze.net', pad, canvas.height - 30);
	return canvas.toDataURL('image/png');
}
