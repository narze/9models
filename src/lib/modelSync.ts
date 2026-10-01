// Pure selection logic for scripts/sync-models.ts. Turns the RubyLLM model
// registry (https://rubyllm.com/models.json) into the per-lab lists the app shows.

export type RawModel = {
	id: string;
	name: string;
	provider: string;
	created_at: string | null;
	modalities?: { output?: string[] };
};

export type Overrides = {
	/** Display names or upstream ids to drop. */
	exclude?: string[];
	/** Extra display names per lab, listed first, for models missing upstream. */
	include?: Record<string, string[]>;
};

export type Generated = Record<string, string[]>;

export const MAX_AGE_MONTHS = 18;

// First-party providers only. Aggregators (openrouter, azure, bedrock, ...) repeat the same models.
export const PROVIDER_LAB: Record<string, string> = {
	anthropic: 'Anthropic',
	openai: 'OpenAI',
	gemini: 'Google',
	xai: 'xAI',
	deepseek: 'DeepSeek',
	mistral: 'Mistral',
	cohere: 'Cohere'
};

// Labs without a first-party provider in the registry. OpenRouter lists them under a vendor prefix.
export const OPENROUTER_PREFIX_LAB: Record<string, string> = {
	'moonshotai/': 'Moonshot',
	'z-ai/': 'Z.ai',
	'minimax/': 'MiniMax',
	'qwen/': 'Alibaba'
};

export const ALL_LABS = [...Object.values(PROVIDER_LAB), ...Object.values(OPENROUTER_PREFIX_LAB)];

// OpenRouter vendors list many sizes and variants, so only the newest models are kept.
const OPENROUTER_LAB_CAP = 10;

// Non-chat and vision-only models, plus Z.ai models that Mistral's API resells (Z.ai comes from OpenRouter).
const DENY_ID =
	/embed|tts|transcribe|realtime|voxtral|ocr|asr|computer-use|customtools|labs-|search|-vl|omni|\dv(-|$)|^zai-/;

// Aliases (-latest) and OpenRouter variants (:free, :batch).
const ALIAS_ID = /-latest$|:/;
const LATEST_SUFFIX = /\s*\(latest\)$/i;

const parseDate = (s: string | null): number =>
	s ? Date.parse(s.replace(' UTC', 'Z').replace(' ', 'T')) : NaN;

const isTextOnly = (m: RawModel): boolean => {
	const out = m.modalities?.output ?? [];
	return out.length === 1 && out[0] === 'text';
};

const labOf = (m: RawModel): string | undefined => {
	if (m.provider !== 'openrouter') return PROVIDER_LAB[m.provider];
	const prefix = Object.keys(OPENROUTER_PREFIX_LAB).find((p) => m.id.startsWith(p));
	return prefix && OPENROUTER_PREFIX_LAB[prefix];
};

export function buildGenerated(
	models: RawModel[],
	opts: { now: Date; overrides?: Overrides; requiredLabs?: string[] }
): Generated {
	const cutoff = new Date(opts.now);
	cutoff.setUTCMonth(cutoff.getUTCMonth() - MAX_AGE_MONTHS);
	const excluded = new Set(opts.overrides?.exclude ?? []);

	const byLab = new Map<string, Map<string, number>>();
	for (const m of models) {
		const lab = labOf(m);
		const created = parseDate(m.created_at);
		const name = m.name.replace(LATEST_SUFFIX, '');
		if (!lab || Number.isNaN(created) || created < cutoff.getTime()) continue;
		if (!isTextOnly(m) || DENY_ID.test(m.id) || ALIAS_ID.test(m.id)) continue;
		if (excluded.has(name) || excluded.has(m.id)) continue;

		const names = byLab.get(lab) ?? new Map<string, number>();
		names.set(name, Math.max(names.get(name) ?? 0, created));
		byLab.set(lab, names);
	}

	const capped = new Set(Object.values(OPENROUTER_PREFIX_LAB));
	const result: Generated = {};
	for (const [lab, names] of byLab) {
		const sorted = [...names]
			.sort(([an, at], [bn, bt]) => bt - at || bn.localeCompare(an))
			.map(([name]) => name);
		result[lab] = capped.has(lab) ? sorted.slice(0, OPENROUTER_LAB_CAP) : sorted;
	}
	for (const [lab, extra] of Object.entries(opts.overrides?.include ?? {})) {
		result[lab] = [...new Set([...extra, ...(result[lab] ?? [])])];
	}

	const empty = (opts.requiredLabs ?? []).filter((lab) => !result[lab]?.length);
	if (empty.length) throw new Error(`No models found for: ${empty.join(', ')}`);
	return result;
}
