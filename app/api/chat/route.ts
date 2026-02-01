import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

const BASE_SYSTEM =
  'You are the AI agent of Mendora Box. You help users generate letters, formal text, emails, and other documents.';

const LEAVE_APPLICATION_RULES = `
For leave applications (e.g. school/college leave, mourning leave):
1. First collect all required details before generating the letter. Do not generate the letter until you have: student name, class/grade, roll number or ID, start date, end date, and reason (if not already given).
2. If a suggested name is provided in context, your first question must be: "Is your name [suggested name]? (Reply Yes or No)" and only then ask for the other details.
3. If they say No, ask "Please tell me your full name."
4. Then ask one by one: Class/Grade, Roll Number or ID, Start date of leave, End date of leave (if not already provided).
5. Once you have all details, generate the leave application letter.
6. In your replies and in the generated letter: use PLAIN TEXT ONLY. Do not use markdown: no asterisks (* or **), no bold/italic symbols, no bullet points with * or -. Use simple line breaks and clear formatting. The generated letter should look like a real letter that can be copied as-is.
7. Keep your conversational replies short. Only the final letter should be long and formal.`;

function buildSystemInstruction(suggestedName: string | null): string {
  let instruction = BASE_SYSTEM + '\n\n' + LEAVE_APPLICATION_RULES;
  if (suggestedName?.trim()) {
    instruction += `\n\nSuggested name from context (use for confirmation): ${suggestedName.trim()}. When the user asks for a leave application, first ask "Is your name ${suggestedName.trim()}? (Reply Yes or No)".`;
  }
  return instruction;
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const systemInstruction = buildSystemInstruction(suggestedName ?? null);

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      config: { systemInstruction },
      contents: messages.map((m) => ({
        role: m.role === 'model' ? 'model' : 'user',
        parts: m.parts,
      })),
    });

    const text = response.text ?? '';
    return NextResponse.json({ text });
  } catch (err: unknown) {
    const status = typeof err === 'object' && err !== null && 'status' in err
      ? (err as { status?: number }).status
      : undefined;
    if (status === 429) {
      console.warn('Chat API: rate limit (429)');
      return NextResponse.json(
        { error: 'Rate limit reached. Please try again in a moment.' },
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
