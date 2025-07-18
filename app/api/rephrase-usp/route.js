import { NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const USP_PROMPT = `You are an expert study abroad counselor. Given the college, program, and a user note, rephrase the note as a short, crisp, India-relevant USP for Indian students planning to go abroad.\n\nInstructions:\n- Make it a direct, actionable, program/college-specific selling point.\n- Use the same style and tone as these USPs: short, direct, no verbose or generic language, max 12–15 words.\n- Do NOT repeat employability rate or average salary.\n- Output only the rephrased USP, no extra text.\n\nCollege: [COLLEGE_NAME]\nProgram: [PROGRAM_NAME]\nUser Note: [USER_NOTE]\nUSP:`;

export async function POST(req) {
  console.log('DEBUG OPENAI_API_KEY:', !!process.env.OPENAI_API_KEY, process.env.OPENAI_API_KEY?.slice(0,8));
  try {
    const { note, college, program } = await req.json();
    if (!note || !college) {
      return NextResponse.json({ error: 'Missing note or college' }, { status: 400 });
    }
    if (!OPENAI_API_KEY) {
      return NextResponse.json({ error: 'Missing OpenAI API key' }, { status: 500 });
    }
    const prompt = USP_PROMPT
      .replace('[COLLEGE_NAME]', college)
      .replace('[PROGRAM_NAME]', program || '')
      .replace('[USER_NOTE]', note);
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 60,
        temperature: 0.7,
      }),
    });
    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error: 'OpenAI API error', details: error }, { status: 500 });
    }
    const data = await response.json();
    const usp = data.choices?.[0]?.message?.content?.trim() || '';
    return NextResponse.json({ usp });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to rephrase USP', details: error instanceof Error ? error.message : error }, { status: 500 });
  }
} 