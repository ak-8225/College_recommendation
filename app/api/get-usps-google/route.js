// Ensure you have GEMINI_API_KEY set in your .env.local and restart your dev server after any changes.
// Example: GEMINI_API_KEY=YOUR_API_KEY
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Optional: Log API key presence in development only
if (process.env.NODE_ENV === 'development') {
  console.log("Loaded GEMINI_API_KEY:", GEMINI_API_KEY ? "✅ Present" : "❌ Missing");
}

// Switch to OpenAI GPT-4o
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (process.env.NODE_ENV === 'development') {
  console.log("Loaded OPENAI_API_KEY:", OPENAI_API_KEY ? "✅ Present" : "❌ Missing");
}

const USP_PROMPT = `
You are a study abroad agent who specialises in answering queries about USP of universities.

Answer based on the following aspects:
1. Campus placement rate based on last year and average package that year (if available).
2. How many Indian students went there last year — how popular is it?
3. Proximity to any flagship geographical areas — that can boost job/internship opportunities.
4. The city where it is located — is that city affordable compared to others in that country?
5. Proximity to most popular cities — how much travel time etc.

Answer everything **very objectively** and in **bullet points**, within **300 words**.

Keep readability **super easy**. Use proper **HTML tags** for formatting.
`;

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const college = searchParams.get('college');
  return await handleUSP(college);
}

export async function POST(req) {
  const body = await req.json();
  const college = body.college;
  return await handleUSP(college);
}

async function handleUSP(college) {
  if (!college || typeof college !== 'string') {
    return new Response(JSON.stringify({
      error: 'Missing college name',
      details: 'Please provide a college name in the query or body.'
    }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  if (!OPENAI_API_KEY) {
    return new Response(JSON.stringify({
      error: 'Missing OpenAI API key',
      details: 'Make sure OPENAI_API_KEY is defined in your environment variables.'
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  const prompt = `${USP_PROMPT}\n\nUniversity: ${college}`;
  const apiUrl = 'https://api.openai.com/v1/chat/completions';

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000); // 10 seconds timeout

  try {
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
        max_tokens: 512,
        temperature: 0.7,
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({
        error: `OpenAI API request failed with status ${response.status}`,
        details: errorText
      }), { status: response.status, headers: { 'Content-Type': 'application/json' } });
    }

    const data = await response.json();
    const resultText = data?.choices?.[0]?.message?.content;

    if (resultText) {
      return new Response(JSON.stringify({
        usps: resultText
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } else {
      return new Response(JSON.stringify({
        error: 'No valid response from OpenAI API',
        details: data
      }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
  } catch (err) {
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: err.name === 'AbortError' ? 'Request timed out after 10s' : String(err)
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
