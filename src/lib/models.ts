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
	[FALLBACK_LAB]: '#8a3f7a'
};

export const MODELS: [lab: string, models: string[]][] = [
	[
		'Anthropic',
		[
			'Claude Mythos 5',
			'Claude Fable 5.1',
			'Claude Fable 5',
			'Claude Opus 5.5',
			'Claude Opus 5',
			'Claude Sonnet 5.5',
			'Claude Sonnet 5',
			'Claude Opus 4.8',
			'Claude Opus 4.7',
			'Claude Opus 4.6',
			'Claude Sonnet 4.6',
			'Claude Opus 4.5',
			'Claude Sonnet 4.5',
			'Claude Haiku 4.5',
			'Claude Opus 4.1'
		]
	],
	[
		'OpenAI',
		[
			'GPT-6 Astra',
			'GPT-6 Sol',
			'GPT-6 Luna',
			'GPT-5.6 Sol',
			'GPT-5.6 Terra',
			'GPT-5.6 Luna',
			'GPT-5.5',
			'GPT-5.4',
			'GPT-5.3 Codex',
			'GPT-5.2',
			'GPT-5.1',
			'GPT-5',
			'GPT-4.1',
			'GPT-4o',
			'o3',
			'o4-mini',
			'o1',
			'gpt-oss-120b',
			'gpt-oss-20b',
			'GPT-4',
			'GPT-3.5 Turbo'
		]
	],
	[
		'Google',
		[
			'Gemini 3.8 Flash',
			'Gemini 3.7 Flash',
			'Gemini 3.6 Flash',
			'Gemini 3.5 Flash',
			'Gemini 3.1 Pro',
			'Gemini 3 Flash',
			'Gemini 2.5 Pro',
			'Gemini 2.5 Flash',
			'Gemma 4 31B',
			'Gemma 4 26B'
		]
	],
	['xAI', ['Grok 4.6', 'Grok 4.3', 'Grok 4.20', 'Grok 4.1 Fast']],
	[
		'DeepSeek',
		['DeepSeek V4.1 Flash', 'DeepSeek V4 Pro', 'DeepSeek V4 Flash', 'DeepSeek V3.2', 'DeepSeek-R1']
	],
	['Meta', ['Llama 4 Maverick', 'Llama 4 Scout', 'Llama 3.3 70B', 'Llama 3.1 405B']],
	[
		'Mistral',
		[
			'Mistral Medium 3.5',
			'Mistral Small 4',
			'Mistral Large 3',
			'Devstral 2',
			'Magistral Medium',
			'Codestral',
			'Mixtral 8x7B',
			'Mistral 7B'
		]
	],
	['Moonshot', ['Kimi K3', 'Kimi K2.7 Code', 'Kimi K2.6', 'Kimi K2.5', 'Kimi K2 Thinking']],
	['Z.ai', ['GLM-5.3', 'GLM-5.2', 'GLM-5.1', 'GLM-5', 'GLM-4.7']],
	['MiniMax', ['MiniMax M3', 'MiniMax M2.7', 'MiniMax M2.5']],
	['Alibaba', ['Qwen3.5 397B', 'Qwen3 Coder Next', 'Qwen3 235B', 'Qwen3 VL']],
	['Amazon', ['Nova Premier', 'Nova 2 Lite', 'Nova Pro']],
	['NVIDIA', ['Nemotron 3 Ultra', 'Nemotron 3 Super', 'Nemotron 3 Nano']],
	['Microsoft', ['Phi-4', 'MAI-Image 2.5']],
	['Cohere', ['Command A Plus', 'Command A', 'Command R+']],
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
