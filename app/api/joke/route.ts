import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 30;

export async function GET() {
  try {
    const apiKey =
      process.env.GEMINI_API_KEY?.trim() ||
      process.env.GOOGLE_API_KEY?.trim();
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    // Support multiple API keys (comma-separated)
    const allKeys = apiKey.includes(',')
      ? apiKey.split(',').map(k => k.trim()).filter(Boolean)
      : [apiKey];

    console.log('Generating joke with Gemini API:', {
      totalKeys: allKeys.length,
      apiKeyPrefix: allKeys[0]?.substring(0, 10),
      environment: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
    });

    // Try API call with key rotation if multiple keys available
    let lastError: unknown = null;
    let response;

    for (let i = 0; i < allKeys.length; i++) {
      const currentKey = allKeys[i];
      try {
        const ai = new GoogleGenAI({ apiKey: currentKey });
        response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: 'Tell me a random, funny joke. Keep it clean and family-friendly. Just the joke, no extra text.',
        });
        console.log(`Joke generated successfully with key ${i + 1}/${allKeys.length}`);
        break;
      } catch (err: unknown) {
        lastError = err;
        const errStatus = (err as { status?: number })?.status;
        // If it's a quota error and we have more keys, try the next one
        if (errStatus === 429 && i < allKeys.length - 1) {
          console.warn(`Key ${i + 1} hit quota limit, trying next key...`);
          continue;
        }
        throw err;
      }
    }

    if (!response) {
      throw lastError || new Error('Failed to generate joke');
    }

    const joke = response.text ?? 'Failed to generate joke';
    
    return NextResponse.json({ joke });
  } catch (err: unknown) {
    const status = (err as { status?: number })?.status;
    const msg = err instanceof Error ? err.message : String(err);
    
    console.error('Joke generation error:', {
      status,
      message: msg,
      error: err,
    });

    if (status === 429) {
      return NextResponse.json(
        { 
          error: 'API quota exceeded. Please check your Gemini API plan and billing details.',
          quotaExceeded: true,
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: `Failed to generate joke: ${msg}` },
      { status: 500 }
    );
  }
}
