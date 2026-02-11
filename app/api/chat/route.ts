import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 30;

const SYSTEM =
  'You are the Mendora Box AI. You generate notices, announcements, emails, and formal documents for principals, HODs, deans, and teachers.\n\n' +
  'RULES:\n' +
  '1. Use the FULL conversation. If the user already said their name (e.g. Parth Jain), designation (Principal/HOD), school name, or document type (holiday notice, etc.), use that. Do NOT ask again.\n' +
  '2. If the user says "draft anything", "according to you", "just be fast", "use your judgment", or similar—fill in reasonable details yourself (e.g. school name, dates, reason) and GENERATE the document immediately. Do not ask more questions.\n' +
  '3. Only ask for missing details when the user has given almost nothing. Once you have enough (name, designation, type of document, and at least one detail), generate the document.\n' +
  '4. Output: PLAIN TEXT only, no markdown. Short replies when asking; the final document is the only long, formal block.';

function getErrorStatus(err: unknown): number | undefined {
  if (err === null || typeof err !== 'object') return undefined;
  const o = err as Record<string, unknown>;
  
  // Check for status directly
  if (typeof o.status === 'number') return o.status;
  if (typeof o.statusCode === 'number') return o.statusCode;
  
  // Check for status in response object
  const res = o.response as Record<string, unknown> | undefined;
  if (res && typeof res === 'object' && typeof (res as { status?: number }).status === 'number') {
    return (res as { status: number }).status;
  }
  
  // Check for status in error details (Gemini API format)
  const details = o.details as Record<string, unknown> | undefined;
  if (details && typeof details === 'object' && typeof (details as { status?: number }).status === 'number') {
    return (details as { status: number }).status;
  }
  
  // Check error message for rate limit indicators
  const message = typeof o.message === 'string' ? o.message : String(err);
  if (message.includes('429') || message.includes('rate limit') || message.includes('quota')) {
    return 429;
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

    const apiKey =
      process.env.GEMINI_API_KEY?.trim() ||
      process.env.GOOGLE_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'Chat is not configured. Set GEMINI_API_KEY or GOOGLE_API_KEY in Vercel → Settings → Environment Variables.',
        },
        { status: 500 }
      );
    }

    const suggested = context?.suggestedName?.trim();
    const systemInstruction =
      SYSTEM +
      (suggested
        ? `\n\nSuggested name (use if user doesn't say otherwise): ${suggested}.`
        : '');

    const MAX_MESSAGES = 10;
    const MAX_PART_CHARS = 800;
    const limited = messages
      .slice(-MAX_MESSAGES)
      .map((m) => ({
        role: m.role,
        parts: m.parts.map((p) => ({
          text: (p.text ?? '').slice(-MAX_PART_CHARS),
        })),
      }));

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: limited,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    const text = response.text ?? '';
    return NextResponse.json({ text });
  } catch (err: unknown) {
    const status = getErrorStatus(err);
    const msg = err instanceof Error ? err.message : String(err);
    
    // Log the full error for debugging
    console.error('Gemini API error details:', {
      status,
      message: msg,
      error: err,
      errorType: err?.constructor?.name,
    });
    
    if (status === 429) {
      // Extract retry-after information if available
      const retryAfter = 
        (err as { retryAfter?: number; details?: { retryAfter?: number } })?.retryAfter ||
        (err as { details?: { retryAfter?: number } })?.details?.retryAfter ||
        60; // Default to 60 seconds
      
      return NextResponse.json(
        { 
          error: `Rate limit reached. Please wait ${retryAfter} seconds before trying again.`,
          retryAfter,
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(retryAfter),
          },
        }
      );
    }
    if (status === 404) {
      return NextResponse.json(
        { error: 'Model not available. Please try again later.' },
        { status: 404 }
      );
    }
    if (status === 503 || msg.includes('503') || msg.includes('UNAVAILABLE')) {
      return NextResponse.json(
        {
          error:
            'Gemini is busy. Please try again in a moment.',
        },
        { status: 503 }
      );
    }
    console.error('Chat API error:', status, msg, err);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
