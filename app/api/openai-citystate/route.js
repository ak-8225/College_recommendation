// app/api/openai-citystate/route.js

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(req) {
  try {
    const { college, country } = await req.json();
    if (!college || typeof college !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing college name' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: 'Missing OpenAI API key' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
    // Compose the prompt
    const prompt = `What is the city and state (or region/province) where the college or university named "${college}" is located${country ? ` in ${country}` : ''}? Please answer in the following JSON format: { "city": "<city>", "state": "<state>" } and do not include any other text.`;
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
        max_tokens: 128,
        temperature: 0.2,
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
    let city = '';
    let state = '';
    if (resultText) {
      try {
        // Try to parse JSON directly
        const parsed = JSON.parse(resultText);
        city = parsed.city || '';
        state = parsed.state || '';
      } catch {
        // Fallback: try to extract with regex
        const cityMatch = resultText.match(/"city"\s*:\s*"([^"]+)"/i);
        const stateMatch = resultText.match(/"state"\s*:\s*"([^"]+)"/i);
        if (cityMatch) city = cityMatch[1];
        if (stateMatch) state = stateMatch[1];
      }
    }
    return new Response(JSON.stringify({ city, state }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal server error', details: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
} 