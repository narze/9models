import { FALLBACK_LAB, MODELS, labOf } from './models';

export const SLOT_COUNT = 9;

export type Slot = { name: string; lab: string };
export type Slots = (Slot | null)[];

export const emptySlots = (): Slots => Array<Slot | null>(SLOT_COUNT).fill(null);

export function setSlot(slots: Slots, index: number, name: string | null): Slots {
	const next = [...slots];
	next[index] = name ? { name, lab: labOf[name] ?? FALLBACK_LAB } : null;
	return next;
}

/** True when `name` is already in another slot. `except` is the slot being edited. */
export function isTaken(slots: Slots, name: string, except = -1): boolean {
	const key = name.toLowerCase();
	return slots.some((s, i) => i !== except && s?.name.toLowerCase() === key);
}

export function filterModels(query: string): [lab: string, models: string[]][] {
	const q = query.trim().toLowerCase();
	return MODELS.map(([lab, ms]): [string, string[]] => [
		lab,
		ms.filter((m) => !q || m.toLowerCase().includes(q) || lab.toLowerCase().includes(q))
	]).filter(([, ms]) => ms.length > 0);
}

export function toShareText(slots: Slots, caption: string): string {
	const lines = ['#My9Models'];
	const cap = caption.trim();
	if (cap) lines.push(cap, '');
	slots.forEach((s, i) => s && lines.push(`${i + 1}. ${s.name}`));
	return lines.join('\n');
}

const isSlot = (v: unknown): v is Slot | null =>
	v === null ||
	(typeof v === 'object' &&
		v !== null &&
		typeof (v as Slot).name === 'string' &&
		typeof (v as Slot).lab === 'string');

export function parseSaved(raw: string | null): { slots: Slots; caption: string } | null {
	if (!raw) return null;
	try {
		const d = JSON.parse(raw);
		if (!Array.isArray(d?.slots) || d.slots.length !== SLOT_COUNT || !d.slots.every(isSlot))
			return null;
		return { slots: d.slots, caption: typeof d.cap === 'string' ? d.cap : '' };
	} catch {
		return null;
	}
}
