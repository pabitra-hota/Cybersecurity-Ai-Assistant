// ============================================================
// CyberShield AI — AI Client
// Per Ollama Cloud docs: https://docs.ollama.com/cloud
// Native API: POST https://ollama.com/api/chat
// ============================================================

// ─── Provider Config ────────────────────────────────────────
const PROVIDER = process.env.AI_PROVIDER || 'ollama'; // 'ollama' | 'gemini'

// Gemini (backup)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

// Ollama Cloud — native API (https://docs.ollama.com/cloud)
// Free model confirmed working: gemma3:4b
const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY || '';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'gemma3:4b';
const OLLAMA_BASE = 'https://ollama.com'; // native base — no /v1

// ─── Gemini Chat ────────────────────────────────────────────
async function geminiChat(
  messages: { role: string; content: string }[],
  options?: { systemPrompt?: string; maxTokens?: number }
) {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

  const history = messages.slice(0, -1).map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const chat = model.startChat({
    history,
    ...(options?.systemPrompt
      ? { systemInstruction: { role: 'user', parts: [{ text: options.systemPrompt }] } }
      : {}),
  });

  const lastMessage = messages[messages.length - 1];
  const result = await chat.sendMessage(lastMessage.content);
  return result.response.text();
}

async function geminiGenerate(prompt: string, maxTokens?: number) {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { maxOutputTokens: maxTokens || 4000 },
  });
  return result.response.text();
}

// ─── Ollama Cloud Chat (Native API per docs.ollama.com/cloud) ──
async function ollamaChat(
  messages: { role: string; content: string }[],
  options?: { systemPrompt?: string; maxTokens?: number }
) {
  const allMessages: { role: string; content: string }[] = [];
  if (options?.systemPrompt) {
    allMessages.push({ role: 'system', content: options.systemPrompt });
  }
  allMessages.push(...messages.map(m => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content,
  })));

  // Native Ollama Cloud endpoint per official docs
  const response = await fetch(`${OLLAMA_BASE}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OLLAMA_API_KEY}`,
    },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages: allMessages,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  // Native Ollama response: { message: { role, content } }
  return data.message?.content || '';
}

async function ollamaGenerate(prompt: string, maxTokens?: number) {
  return ollamaChat([{ role: 'user', content: prompt }], { maxTokens });
}

// ─── Unified Interface ──────────────────────────────────────
export async function chatCompletion(
  messages: { role: string; content: string }[],
  options?: { systemPrompt?: string; maxTokens?: number }
): Promise<string> {
  if (PROVIDER === 'ollama' && OLLAMA_API_KEY) {
    return ollamaChat(messages, options);
  }
  if (GEMINI_API_KEY) {
    return geminiChat(messages, options);
  }
  throw new Error('No AI provider configured. Set OLLAMA_API_KEY in environment variables.');
}

export async function generateText(
  prompt: string,
  options?: { maxTokens?: number }
): Promise<string> {
  if (PROVIDER === 'ollama' && OLLAMA_API_KEY) {
    return ollamaGenerate(prompt, options?.maxTokens);
  }
  if (GEMINI_API_KEY) {
    return geminiGenerate(prompt, options?.maxTokens);
  }
  throw new Error('No AI provider configured. Set OLLAMA_API_KEY in environment variables.');
}

// Check if any AI provider is configured
export function isAIConfigured(): boolean {
  return !!(OLLAMA_API_KEY || GEMINI_API_KEY);
}
