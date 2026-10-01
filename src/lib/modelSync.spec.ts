import { describe, expect, it } from 'vitest';
import { buildGenerated, type RawModel } from './modelSync';

const NOW = new Date('2026-10-01T00:00:00Z');

const raw = (
	provider: string,
	id: string,
	name: string,
	created = '2026-06-01 00:00:00 UTC',
	output: string[] = ['text']
): RawModel => ({ id, name, provider, created_at: created, modalities: { output } });

const build = (models: RawModel[], overrides = {}) =>
	buildGenerated(models, { now: NOW, overrides });

describe('buildGenerated', () => {
	it('maps first-party providers to lab names', () => {
		const out = build([
			raw('anthropic', 'claude-opus-5', 'Claude Opus 5'),
			raw('gemini', 'gemini-3.5-flash', 'Gemini 3.5 Flash')
		]);
		expect(out.Anthropic).toEqual(['Claude Opus 5']);
		expect(out.Google).toEqual(['Gemini 3.5 Flash']);
	});

	it('ignores aggregator providers', () => {
		const out = build([
			raw('anthropic', 'claude-opus-5', 'Claude Opus 5'),
			raw('openrouter', 'anthropic/claude-opus-5', 'Anthropic: Claude Opus 5'),
			raw('bedrock', 'anthropic.claude-opus-5', 'Claude Opus 5 (Bedrock)')
		]);
		expect(out.Anthropic).toEqual(['Claude Opus 5']);
		expect(Object.keys(out)).toEqual(['Anthropic']);
	});

	it('keeps only models released in the last 18 months', () => {
		const out = build([
			raw('openai', 'gpt-5', 'GPT-5', '2025-08-07 00:00:00 UTC'),
			raw('openai', 'gpt-4.1', 'GPT-4.1', '2025-04-01 00:00:00 UTC'),
			raw('openai', 'gpt-4o', 'GPT-4o', '2024-05-13 00:00:00 UTC')
		]);
		expect(out.OpenAI).toEqual(['GPT-5', 'GPT-4.1']);
	});

	it('drops models with no release date', () => {
		const out = build([
			raw('openai', 'gpt-5', 'GPT-5'),
			{ ...raw('openai', 'mystery', 'Mystery'), created_at: null }
		]);
		expect(out.OpenAI).toEqual(['GPT-5']);
	});

	it('keeps only models with text-only output', () => {
		const out = build([
			raw('openai', 'gpt-5', 'GPT-5'),
			raw('openai', 'gpt-image', 'GPT Image', undefined, ['text', 'image']),
			raw('openai', 'embed', 'Embed', undefined, ['embeddings']),
			raw('openai', 'no-modalities', 'None', undefined, [])
		]);
		expect(out.OpenAI).toEqual(['GPT-5']);
	});

	it('drops ids that match the denylist', () => {
		const out = build([
			raw('openai', 'gpt-5', 'GPT-5'),
			raw('openai', 'gpt-4o-search-preview', 'GPT-4o Search Preview'),
			raw('openai', 'gpt-realtime', 'GPT Realtime'),
			raw('mistral', 'zai-glm-5-3', 'GLM-5.3')
		]);
		expect(out.OpenAI).toEqual(['GPT-5']);
		expect(out.Mistral).toBeUndefined();
	});

	it('drops -latest alias ids', () => {
		const out = build([
			raw('gemini', 'gemini-flash-latest', 'Gemini Flash Latest'),
			raw('gemini', 'gemini-3.8-flash', 'Gemini 3.8 Flash')
		]);
		expect(out.Google).toEqual(['Gemini 3.8 Flash']);
	});

	it('dedupes snapshots and (latest) aliases by display name', () => {
		const out = build([
			raw('anthropic', 'claude-opus-4-5-20251101', 'Claude Opus 4.5'),
			raw('anthropic', 'claude-opus-4-5', 'Claude Opus 4.5 (latest)'),
			raw('openai', 'gpt-5.5', 'GPT-5.5'),
			raw('openai', 'gpt-5.5-2026-04-23', 'GPT-5.5')
		]);
		expect(out.Anthropic).toEqual(['Claude Opus 4.5']);
		expect(out.OpenAI).toEqual(['GPT-5.5']);
	});

	it('sorts newest first, then by name descending', () => {
		const out = build([
			raw('openai', 'a', 'GPT-5', '2026-01-01 00:00:00 UTC'),
			raw('openai', 'b', 'GPT-6 Luna', '2026-09-22 00:00:00 UTC'),
			raw('openai', 'c', 'GPT-6 Sol', '2026-09-22 00:00:00 UTC')
		]);
		expect(out.OpenAI).toEqual(['GPT-6 Sol', 'GPT-6 Luna', 'GPT-5']);
	});

	it('applies overrides: exclude by name or id, include extra names first', () => {
		const out = build(
			[
				raw('openai', 'gpt-5', 'GPT-5'),
				raw('openai', 'gpt-5-mini', 'GPT-5 Mini'),
				raw('openai', 'gpt-5-nano', 'GPT-5 Nano')
			],
			{
				exclude: ['GPT-5 Mini', 'gpt-5-nano'],
				include: { OpenAI: ['GPT-Secret'], xAI: ['Grok X'] }
			}
		);
		expect(out.OpenAI).toEqual(['GPT-Secret', 'GPT-5']);
		expect(out.xAI).toEqual(['Grok X']);
	});

	it('does not duplicate an included name that upstream already has', () => {
		const out = build([raw('openai', 'gpt-5', 'GPT-5')], { include: { OpenAI: ['GPT-5'] } });
		expect(out.OpenAI).toEqual(['GPT-5']);
	});

	it('throws when a lab ends up empty, to avoid wiping the list', () => {
		expect(() =>
			buildGenerated([raw('openai', 'gpt-5', 'GPT-5')], {
				now: NOW,
				requiredLabs: ['OpenAI', 'xAI']
			})
		).toThrow(/xAI/);
	});
});
