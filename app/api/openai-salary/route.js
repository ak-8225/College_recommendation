// app/api/openai-salary/route.js

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(req) {
  try {
    const { prompt } = await req.json();
    console.log('DEBUG: Received OpenAI prompt:', prompt);
    if (!prompt || typeof prompt !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing prompt' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: 'Missing OpenAI API key' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
    const apiUrl = 'https://api.openai.com/v1/chat/completions';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    const response = await fetch(apiUrl, {
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
        max_tokens: 256,
        temperature: 0.4,
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: `OpenAI API request failed with status ${response.status}`, details: errorText }), { status: response.status, headers: { 'Content-Type': 'application/json' } });
    }
    const data = await response.json();
    const resultText = data?.choices?.[0]?.message?.content;
    console.log('DEBUG: OpenAI API response:', resultText);
    // Try to extract the salary line (first line or line starting with 'Estimated Starting Salary:')
    let salary = 'N/A';
    if (resultText) {
      const match = resultText.match(/Estimated Starting Salary\s*[:：]?\s*(.+)/i);
      if (match && match[1]) {
        salary = match[1].trim();
      } else {
        // fallback: use first non-empty line
        const firstLine = resultText.split('\n').find(line => line.trim());
        if (firstLine) salary = firstLine.trim();
      }
    }
    return new Response(JSON.stringify({ salary }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal server error', details: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
} 