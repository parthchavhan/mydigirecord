import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

// Allow up to 60s on Vercel Pro (Hobby has lower limits)
export const maxDuration = 60;

const SYSTEM =
  'You are the AI agent of Mendora Box. You help users generate notices, announcements, emails, and other formal documents.\n\n' +
  'This app is for principals, HODs, deans, and teachers.\n\n' +
  'Principals, HODs, and deans typically write: notices (e.g. holiday notices, "3 days holidays for this class"), announcements, circulars, and emails to staff or students. Ask for: designation, institution/department, type of notice (holiday, event, announcement, etc.), dates if relevant, and any details (e.g. which class, reason). Then generate the notice/announcement/email in plain text—no markdown. Keep replies short; only the final document is long and formal.\n\n' +
  'Teachers may also ask for leave applications: collect full name, designation, institution, start date, end date, and reason, then generate the letter. Use PLAIN TEXT only—no markdown.';

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

    const systemInstruction = context?.suggestedName?.trim()
      ? SYSTEM + `\n\nSuggested name (use if user doesn't say otherwise): ${context.suggestedName.trim()}.`
      : SYSTEM;

    const limited = messages
      .slice(-8)
      .map((m) => ({
        role: m.role,
        parts: m.parts.map((p) => ({
          text: (p.text ?? '').slice(-1200),
        })),
      }));

    const ai = new GoogleGenAI({ apiKey });
    const stream = await ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      config: { systemInstruction },
      contents: limited,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.text ?? '';
            if (delta) controller.enqueue(encoder.encode(JSON.stringify({ text: delta }) + '\n'));
          }
        } catch (e) {
          const err = e instanceof Error ? e.message : String(e);
          if (err.includes('429') || (e as { status?: number })?.status === 429) {
            controller.enqueue(encoder.encode(JSON.stringify({ error: 'Rate limit reached. Please wait a minute and try again.' }) + '\n'));
          } else {
            controller.enqueue(encoder.encode(JSON.stringify({ error: 'Something went wrong. Please try again.' }) + '\n'));
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: { 'Content-Type': 'application/x-ndjson' },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('429') || (err as { status?: number })?.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit reached. Please wait a minute and try again.' },
        { status: 429 }
      );
    }
    if (msg.includes('404') || (err as { status?: number })?.status === 404) {
      return NextResponse.json(
        { error: 'Model not available. Please try again later.' },
        { status: 404 }
      );
    }
    console.error('Chat API error:', msg);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
