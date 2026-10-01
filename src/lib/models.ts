import generatedJson from './models.generated.json';

export const FALLBACK_LAB = 'Image / Audio';

export const LABS: Record<string, string> = {
	Anthropic: '#b5573a',
	OpenAI: '#0f8f73',
	Google: '#3b6fd6',
	xAI: '#2b2f36',
	DeepSeek: '#4a5fe0',
	Meta: '#2a55e0',
	Mistral: '#e0520f',
	Moonshot: '#1f7a8c',
	'Z.ai': '#7a3ff0',
	MiniMax: '#d6336c',
	Alibaba: '#6f3fd1',
	Amazon: '#c77700',
	NVIDIA: '#4d8a00',
	Microsoft: '#0a7abf',
	Cohere: '#8a5a44',
	Cursor: '#1c1c1c',
	[FALLBACK_LAB]: '#8a3f7a'
};

// Labs synced from the RubyLLM registry by scripts/sync-models.ts. The rest are hand-curated.
const generated: Record<string, string[]> = generatedJson;
const auto = (lab: string): [string, string[]] => [lab, generated[lab] ?? []];

export const MODELS: [lab: string, models: string[]][] = [
	auto('Anthropic'),
	auto('OpenAI'),
	auto('Google'),
	auto('xAI'),
	auto('DeepSeek'),
	['Meta', ['Llama 4 Maverick', 'Llama 4 Scout', 'Llama 3.3 70B', 'Llama 3.1 405B']],
	auto('Mistral'),
	auto('Moonshot'),
	auto('Z.ai'),
	auto('MiniMax'),
	auto('Alibaba'),
	['Amazon', ['Nova Premier', 'Nova 2 Lite', 'Nova Pro']],
	['NVIDIA', ['Nemotron 3 Ultra', 'Nemotron 3 Super', 'Nemotron 3 Nano']],
	['Microsoft', ['Phi-4', 'MAI-Image 2.5']],
	auto('Cohere'),
	['Cursor', ['Composer 2.5', 'Composer 2', 'Composer 1']],
	[
		FALLBACK_LAB,
		[
			'Nano Banana Pro',
			'Nano Banana 2',
			'Nano Banana',
			'GPT Image 2',
			'Sora 2',
			'Veo 3.1',
			'FLUX.2 pro',
			'Stable Diffusion 3.5',
			'ElevenLabs v3',
			'Whisper'
		]
	]
];

export const labOf: Record<string, string> = Object.fromEntries(
	MODELS.flatMap(([lab, ms]) => ms.map((m) => [m, lab]))
);

export const labColor = (lab: string): string => LABS[lab] ?? LABS[FALLBACK_LAB];
