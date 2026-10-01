// Usage: node scripts/sync-models.ts
// Fetches the RubyLLM model registry and writes src/lib/models.generated.json.
import { readFileSync, writeFileSync } from 'node:fs';
import { ALL_LABS, buildGenerated, type RawModel } from '../src/lib/modelSync.ts';

const SOURCE = 'https://rubyllm.com/models.json';
const OUT = new URL('../src/lib/models.generated.json', import.meta.url);
const OVERRIDES = new URL('./models.overrides.json', import.meta.url);

const res = await fetch(SOURCE);
if (!res.ok) throw new Error(`Fetch ${SOURCE} failed: ${res.status}`);
const models = (await res.json()) as RawModel[];
if (!Array.isArray(models) || models.length === 0) throw new Error('Registry is empty');

const generated = buildGenerated(models, {
	now: new Date(),
	overrides: JSON.parse(readFileSync(OVERRIDES, 'utf8')),
	requiredLabs: ALL_LABS
});

writeFileSync(OUT, JSON.stringify(generated, null, '\t') + '\n');
console.log(
	Object.entries(generated)
		.map(([lab, m]) => `${lab}: ${m.length}`)
		.join('\n')
);
