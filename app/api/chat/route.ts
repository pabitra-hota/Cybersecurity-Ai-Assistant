import { NextRequest, NextResponse } from 'next/server';
import { chatCompletion, isAIConfigured } from '@/lib/ai-client';

const systemPrompt = `You are CyberShield AI Assistant — a friendly, expert cybersecurity advisor.
Your job is to help regular people understand cybersecurity threats and protect themselves online.
You speak in simple, clear English — never use unexplained jargon. You are patient, calm, and reassuring.

YOUR CAPABILITIES:
- Explain cybersecurity concepts simply
- Analyze URLs or domains the user pastes
- Explain what a scan result means
- Advise if something is a scam, phishing, or fraud
- Give step-by-step protection advice

RESPONSE RULES:
- Always start with a direct answer to the question
- Use bullet points for steps or tips
- Add relevant emojis sparingly (🛡️ 🚨 ✅ ⚠️) for clarity
- End every response with one actionable tip
- Never be alarmist — be calm and solution-focused
- If you are unsure, say so honestly`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();
    if (!messages?.length) return NextResponse.json({ error: 'No messages' }, { status: 400 });

    if (!isAIConfigured()) {
      return NextResponse.json({
        role: 'assistant',
        content: '🛡️ **CyberShield AI Assistant**\n\nI\'m your AI security advisor! To enable live AI responses, please add your Ollama API key to `.env.local`.\n\nIn the meantime, here are some general cybersecurity tips:\n\n- ✅ Use strong, unique passwords for every account\n- ✅ Enable two-factor authentication everywhere\n- ✅ Keep your software and OS updated\n- ✅ Be cautious of unexpected emails and links\n\n💡 **Quick Tip:** Consider using a password manager to generate and store complex passwords securely.',
      });
    }

    const responseText = await chatCompletion(
      messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
      { systemPrompt }
    );

    return NextResponse.json({
      role: 'assistant',
      content: responseText || 'I apologize, I could not generate a response.',
    });
  } catch (error: unknown) {
    console.error('Chat error:', error);

    const errMsg = error instanceof Error ? error.message : String(error);
    if (errMsg.includes('429') || errMsg.includes('rate') || errMsg.includes('quota')) {
      return NextResponse.json({
        role: 'assistant',
        content: '⏳ **Rate Limit Reached**\n\nPlease wait a moment and try again.\n\n💡 **Tip:** Cloud models have usage limits. Try spacing out your requests.',
      });
    }

    return NextResponse.json({
      role: 'assistant',
      content: `⚠️ Sorry, I encountered an error: ${errMsg.slice(0, 200)}. Please try again.`,
    });
  }
}
