// app/api/get-fit-score/route.js

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const { setCache, getCache } = require('../cache');

const FIT_SCORE_PROMPT = `You are a study abroad data expert. Given the following university and user data, calculate a unique "College Fit Score" (0-95%) for this student. Use this algorithm:

- Inputs: Ranking, Tuition Fee, Break-even (ROI), User Budget, User Priorities (array: ranking, budget, roi, tuition_fee)
- Priorities are weighted most heavily (double weight)
- Normalize all values across the provided set (simulate if only one college)
- The score must be unique for each college (use a deterministic offset based on college name)
- Clamp the score to a maximum of 95%
- Return only the score as a number (e.g., 87)

Inputs:
University: [COLLEGE]
Country: [COUNTRY]
City: [CITY]
Ranking: [RANKING]
Tuition Fee: [TUITIONFEE]
Break-even (ROI): [ROI]
User Budget: [BUDGET]
User Priorities: [PRIORITIES]

Calculate and return only the fit score (0-95):`;

export async function POST(req) {
  const body = await req.json();
  const { college, country, city, tuitionFee, livingCosts, avgSalary, ranking, priorities, budget, phone, roi } = body;
  // Use phone+college as cache key
  const cacheKey = `fitscore:${phone || ''}:${college || ''}`;
  const cached = getCache(cacheKey);
  if (cached) {
    return new Response(JSON.stringify({ fitScore: cached }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
  if (!college || typeof college !== 'string') {
    return new Response(JSON.stringify({ error: 'Missing college name' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
  if (!OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: 'Missing OpenAI API key' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
  // Compose the prompt
  const prompt = FIT_SCORE_PROMPT
    .replace('[COLLEGE]', college)
    .replace('[COUNTRY]', country || '')
    .replace('[CITY]', city || '')
    .replace('[RANKING]', ranking || '')
    .replace('[TUITIONFEE]', tuitionFee || '')
    .replace('[ROI]', roi || '')
    .replace('[BUDGET]', budget || '')
    .replace('[PRIORITIES]', Array.isArray(priorities) ? priorities.join(', ') : (priorities || ''));

  // LOGGING: Log all incoming data and prompt
  console.log('--- get-fit-score API called ---');
  console.log('POST body:', body);
  console.log('Prompt sent to OpenAI:', prompt);

  const apiUrl = 'https://api.openai.com/v1/chat/completions';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
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
        max_tokens: 16,
        temperature: 0.2,
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!response.ok) {
      const errorText = await response.text();
      console.log('OpenAI API error:', errorText);
      return new Response(JSON.stringify({ error: `OpenAI API request failed with status ${response.status}`, details: errorText }), { status: response.status, headers: { 'Content-Type': 'application/json' } });
    }
    const data = await response.json();
    const resultText = data?.choices?.[0]?.message?.content;
    console.log('OpenAI raw response:', resultText);
    let fitScore = 0;
    if (resultText) {
      const match = resultText.match(/(\d{1,2}|9[0-5])/);
      if (match && match[0]) {
        fitScore = parseInt(match[0], 10);
        if (fitScore > 95) fitScore = 95;
      }
    }
    setCache(cacheKey, fitScore, 60 * 60 * 1000);
    // If parsing failed, return the raw OpenAI response for debugging
    if (fitScore === 0) {
      return new Response(JSON.stringify({ fitScore, debug: { resultText, prompt, body } }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ fitScore }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.log('Internal server error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error', details: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
} 