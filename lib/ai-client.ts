// ============================================================
// CyberShield AI — AI Client (supports multiple providers)
// ============================================================

// ─── Provider Config ────────────────────────────────────────
const PROVIDER = process.env.AI_PROVIDER || 'gemini'; // 'gemini' | 'ollama'

// Gemini
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

// Ollama Cloud
const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY || '';
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'https://ollama.com/v1';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:cloud';

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

// ─── Ollama Cloud Chat (OpenAI-compatible) ──────────────────
async function ollamaChat(
  messages: { role: string; content: string }[],
  options?: { systemPrompt?: string; maxTokens?: number }
) {
  const allMessages = [];
  if (options?.systemPrompt) {
    allMessages.push({ role: 'system', content: options.systemPrompt });
  }
  allMessages.push(...messages.map(m => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content,
  })));

  const response = await fetch(`${OLLAMA_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OLLAMA_API_KEY}`,
    },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages: allMessages,
      max_tokens: options?.maxTokens || 4000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
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
  throw new Error('No AI provider configured. Set GEMINI_API_KEY or OLLAMA_API_KEY in .env.local');
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
  throw new Error('No AI provider configured. Set GEMINI_API_KEY or OLLAMA_API_KEY in .env.local');
}

// Check if any AI provider is configured
export function isAIConfigured(): boolean {
  return !!(GEMINI_API_KEY || OLLAMA_API_KEY);
}
