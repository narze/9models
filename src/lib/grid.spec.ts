import { describe, expect, it } from 'vitest';
import {
	SLOT_COUNT,
	emptySlots,
	filterModels,
	isTaken,
	parseSaved,
	setSlot,
	toShareText
} from './grid';
import { MODELS } from './models';

describe('setSlot', () => {
	it('puts a model into a slot and infers its lab', () => {
		const slots = setSlot(emptySlots(), 0, 'GPT-5');
		expect(slots[0]).toEqual({ name: 'GPT-5', lab: 'OpenAI' });
		expect(slots).toHaveLength(SLOT_COUNT);
	});

	it('uses the fallback lab for custom names', () => {
		expect(setSlot(emptySlots(), 2, 'My Local Model')[2]?.lab).toBe('Image / Audio');
	});

	it('does not mutate the input', () => {
		const before = emptySlots();
		setSlot(before, 0, 'GPT-5');
		expect(before[0]).toBeNull();
	});

	it('removes a model when name is null', () => {
		const slots = setSlot(setSlot(emptySlots(), 1, 'Grok 4.6'), 1, null);
		expect(slots[1]).toBeNull();
	});
});

describe('isTaken', () => {
	const slots = setSlot(emptySlots(), 0, 'GPT-5');

	it('matches case-insensitively', () => {
		expect(isTaken(slots, 'gpt-5')).toBe(true);
	});

	it('ignores the slot being edited', () => {
		expect(isTaken(slots, 'GPT-5', 0)).toBe(false);
	});

	it('is false for unused names', () => {
		expect(isTaken(slots, 'GPT-4o')).toBe(false);
	});
});

describe('filterModels', () => {
	it('returns everything for an empty query', () => {
		expect(filterModels('').length).toBeGreaterThan(10);
	});

	it('matches model names', () => {
		const out = filterModels('opus 5');
		expect(out).toHaveLength(1);
		expect(out[0][0]).toBe('Anthropic');
		expect(out[0][1]).toEqual(['Claude Opus 5.5', 'Claude Opus 5']);
	});

	it('matches whole lab by lab name', () => {
		const out = filterModels('xai');
		expect(out.map(([lab]) => lab)).toEqual(['xAI']);
		expect(out[0][1]).toEqual(MODELS.find(([lab]) => lab === 'xAI')![1]);
	});

	it('returns nothing when no match', () => {
		expect(filterModels('zzzz')).toEqual([]);
	});
});

describe('toShareText', () => {
	it('lists ranked models and skips empty slots', () => {
		let slots = setSlot(emptySlots(), 0, 'GPT-5');
		slots = setSlot(slots, 2, 'Grok 4.6');
		expect(toShareText(slots, '')).toBe('#My9Models\n1. GPT-5\n3. Grok 4.6');
	});

	it('puts the caption under the header', () => {
		const slots = setSlot(emptySlots(), 0, 'GPT-5');
		expect(toShareText(slots, '  hello ')).toBe('#My9Models\nhello\n\n1. GPT-5');
	});
});

describe('parseSaved', () => {
	it('restores valid data', () => {
		const slots = setSlot(emptySlots(), 0, 'GPT-5');
		expect(parseSaved(JSON.stringify({ slots, cap: 'hi' }))).toEqual({ slots, caption: 'hi' });
	});

	it.each([null, '', 'not json', '{}', '{"slots":[1,2]}'])('rejects %j', (raw) => {
		expect(parseSaved(raw)).toBeNull();
	});
});
