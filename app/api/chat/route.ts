import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

// Allow up to 60s on Vercel Pro (Hobby has lower limits)
export const maxDuration = 60;

const SYSTEM =
  'You are the AI agent of Mendora Box. You help users generate notices, announcements, emails, and other formal documents.\n\n' +
  'This app is for principals, HODs, deans, and teachers.\n\n' +
  'Principals, HODs, and deans typically write: notices (e.g. holiday notices, "3 days holidays for this class"), announcements, circulars, and emails to staff or students. Ask for: designation, institution/department, type of notice (holiday, event, announcement, etc.), dates if relevant, and any details (e.g. which class, reason). Then generate the notice/announcement/email in plain text—no markdown. Keep replies short; only the final document is long and formal.\n\n' +
  'Teachers may also ask for leave applications: collect full name, designation, institution, start date, end date, and reason, then generate the letter. Use PLAIN TEXT only—no markdown.';

function getErrorStatus(err: unknown): number | undefined {
  if (err === null || typeof err !== 'object') return undefined;
  const o = err as Record<string, unknown>;
  if (typeof o.status === 'number') return o.status;
  if (typeof o.statusCode === 'number') return o.statusCode;
  const res = o.response as Record<string, unknown> | undefined;
  if (res && typeof res === 'object' && typeof (res as { status?: number }).status === 'number') {
    return (res as { status: number }).status;
  }
  return undefined;
}

export async function POST(req: Request) {
  try {
    const { messages, context } = (await req.json()) as {
      messages: Array<{ role: 'user' | 'model'; parts: { text: string }[] }>;
      context?: { suggestedName?: string | null };
    };

    if (!messages?.length) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chat is not configured. Add GEMINI_API_KEY in your environment.' },
        { status: 500 }
      );
    }

    // Build a single plain-text prompt, like the official examples:
    // https://ai.google.dev/gemini-api/docs/text-generation#javascript
    const suggested = context?.suggestedName?.trim();
    const lastUserText =
      messages
        .filter((m) => m.role === 'user')
        .map((m) => (m.parts[0]?.text ?? '').trim())
        .filter(Boolean)
        .pop() ?? '';

    const prompt =
      SYSTEM +
      (suggested
        ? `\n\nSuggested name (use if user doesn't say otherwise): ${suggested}.`
        : '') +
      (lastUserText ? `\n\nUser request:\n${lastUserText}` : '');

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    const text = response.text ?? '';
    return NextResponse.json({ text });
  } catch (err: unknown) {
    const status = getErrorStatus(err);
    if (status === 429) {
      return NextResponse.json(
        { error: 'Rate limit reached. Please wait a minute and try again.' },
        { status: 429 }
      );
    }
    if (status === 404) {
      return NextResponse.json(
        { error: 'Model not available. Please try again later.' },
        { status: 404 }
      );
    }
    console.error('Chat API error:', err);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
