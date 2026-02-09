import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

const BASE_SYSTEM =
  'You are the AI agent of Mendora Box. You help users generate letters, formal text, emails, and other documents.';

const LEAVE_APPLICATION_RULES = `
This app is for principals, HODs, deans, and teachers. Do NOT ask for class, grade, or roll number.

For leave applications (e.g. school/college leave, mourning leave):
1. First collect all required details before generating the letter. Do not generate the letter until you have: full name, designation (e.g. Principal, HOD, Dean, Teacher), institution/department name, start date, end date, and reason (if not already given).
2. Then ask one by one: Designation (Principal / HOD / Dean / Teacher), Institution or department name, Start date of leave, End date of leave (if not already provided).
3. Once you have all details, generate the leave application letter addressed appropriately (e.g. To the management / To the Chairman / To the Vice Chancellor).
4. In your replies and in the generated letter: use PLAIN TEXT ONLY. Do not use markdown: no asterisks (* or **), no bold/italic symbols, no bullet points with * or -. Use simple line breaks and clear formatting. The generated letter should look like a real letter that can be copied as-is.
5. Keep your conversational replies short. Only the final letter should be long and formal.`;

function buildSystemInstruction(suggestedName: string | null): string {
  let instruction = BASE_SYSTEM + '\n\n' + LEAVE_APPLICATION_RULES;
  if (suggestedName?.trim()) {
    instruction += `\n\nSuggested name from context (you may use it as the user's name if they do not specify otherwise): ${suggestedName.trim()}.`;
  }
  return instruction;
}

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
    const body = (await req.json()) as {
      messages: Array<{ role: 'user' | 'model'; parts: { text: string }[] }>;
      context?: { suggestedName?: string | null };
    };
    const { messages, context } = body;
    const suggestedName = context?.suggestedName ?? null;

    if (!messages?.length) {
      return NextResponse.json(
        { error: 'Messages are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey?.trim()) {
      console.error('Chat API: GEMINI_API_KEY is not set (add it in Vercel → Settings → Environment Variables)');
      return NextResponse.json(
        { error: 'Chat is not configured. Please add GEMINI_API_KEY in your deployment environment.' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
    const systemInstruction = buildSystemInstruction(suggestedName ?? null);

    const MAX_MESSAGES = 8;
    const MAX_PART_CHARS = 1200;

    const limitedMessages = messages
      .slice(-MAX_MESSAGES)
      .map((m) => ({
        role: m.role,
        parts: m.parts.map((p) => {
          const text = p.text ?? '';
          if (text.length <= MAX_PART_CHARS) return { text };
          // Keep the most recent portion of the text, which tends to be most relevant.
          return { text: text.slice(-MAX_PART_CHARS) };
        }),
      }));

    const callGemini = () =>
      ai.models.generateContent({
        model: "gemini-3-flash-preview",
        config: { systemInstruction },
        contents: limitedMessages.map((m) => ({
          role: m.role === 'model' ? 'model' : 'user',
          parts: m.parts,
        })),
      });

    let response;
    try {
      response = await callGemini();
    } catch (firstErr: unknown) {
      const status = getErrorStatus(firstErr);
      if (status === 429) {
        await new Promise((r) => setTimeout(r, 3000));
        try {
          response = await callGemini();
        } catch (retryErr: unknown) {
          const retryStatus = getErrorStatus(retryErr);
          if (retryStatus === 429) {
            console.warn('Chat API: rate limit (429) after retry');
            return NextResponse.json(
              { error: 'Rate limit reached. Please wait a minute and try again.' },
              { status: 429 }
            );
          }
          throw retryErr;
        }
      } else {
        throw firstErr;
      }
    }

    const text = response.text ?? '';
    return NextResponse.json({ text });
  } catch (err: unknown) {
    const status = getErrorStatus(err);
    if (status === 429) {
      console.warn('Chat API: rate limit (429)');
      return NextResponse.json(
        { error: 'Rate limit reached. Please wait a minute and try again.' },
        { status: 429 }
      );
    }
    if (status === 404) {
      console.warn('Chat API: model not found (404)');
      return NextResponse.json(
        { error: 'Model not available. Please try again later.' },
        { status: 404 }
      );
    }
    console.error('Chat API error:', err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
