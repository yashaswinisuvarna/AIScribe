import { NextResponse } from 'next/server'

// Use the server-side Google Generative AI SDK to avoid crafting raw REST payloads.
export async function POST(req: Request) {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'No API key configured' }, { status: 500 });

  const mod = await import('@google/generative-ai');
  const GoogleGenerativeAI = mod.GoogleGenerativeAI;

  const body = await req.json().catch(() => null);
  const prompt = body?.prompt || '';
  const modelName = body?.model || 'gemini-2.5-flash';

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    const generationConfig = {
      temperature: 0.8,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 1024,
    };

    const chatSession = model.startChat({ generationConfig, history: [] });
    const result = await chatSession.sendMessage(prompt);

    // result.response.text() is a helper added by the SDK to extract text
    const text = result?.response?.text ? result.response.text() : undefined;

    return NextResponse.json({ text, raw: result });
  }
  catch (err: any) {
    const msg = err?.message || String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
