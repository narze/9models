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

// Non-chat models, plus Z.ai models that Mistral's API resells (Z.ai is hand-curated).
const DENY_ID =
	/embed|tts|transcribe|realtime|voxtral|ocr|computer-use|customtools|labs-|search|^zai-/;

const ALIAS_ID = /-latest$/;
const LATEST_SUFFIX = /\s*\(latest\)$/i;

const parseDate = (s: string | null): number =>
	s ? Date.parse(s.replace(' UTC', 'Z').replace(' ', 'T')) : NaN;

const isTextOnly = (m: RawModel): boolean => {
	const out = m.modalities?.output ?? [];
	return out.length === 1 && out[0] === 'text';
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
		const lab = PROVIDER_LAB[m.provider];
		const created = parseDate(m.created_at);
		const name = m.name.replace(LATEST_SUFFIX, '');
		if (!lab || Number.isNaN(created) || created < cutoff.getTime()) continue;
		if (!isTextOnly(m) || DENY_ID.test(m.id) || ALIAS_ID.test(m.id)) continue;
		if (excluded.has(name) || excluded.has(m.id)) continue;

		const names = byLab.get(lab) ?? new Map<string, number>();
		names.set(name, Math.max(names.get(name) ?? 0, created));
		byLab.set(lab, names);
	}

	const result: Generated = {};
	for (const [lab, names] of byLab) {
		result[lab] = [...names]
			.sort(([an, at], [bn, bt]) => bt - at || bn.localeCompare(an))
			.map(([name]) => name);
	}
	for (const [lab, extra] of Object.entries(opts.overrides?.include ?? {})) {
		result[lab] = [...new Set([...extra, ...(result[lab] ?? [])])];
	}

	const empty = (opts.requiredLabs ?? []).filter((lab) => !result[lab]?.length);
	if (empty.length) throw new Error(`No models found for: ${empty.join(', ')}`);
	return result;
}
