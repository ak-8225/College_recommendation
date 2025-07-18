// app/api/get-comparison-metrics/route.js

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const { setCache, getCache } = require('../cache');

const IMPROVED_PROMPT = `You are a study abroad data expert specializing in analyzing university metrics for international students.  
Given the following university name, country, and city (if available), return the latest available and structured data for these indicators:

1. Graduate Employability Rate – percentage of graduates employed or in further study within 6 months to a year.
2. Average Starting Salary – average salary of recent graduates in local currency and USD equivalent.
3. Career Progression Rate – percentage of graduates promoted or changed roles within 3 years of graduation.
4. Industry Network Score – qualitative or quantitative score reflecting university's collaboration with industries or corporates.
5. Annual Tuition Fees – latest undergraduate tuition fees (converted to USD if not in local currency).
6. Living Costs (Annual) – average cost of living per year for an international student.
7. Accommodation Costs – typical on-campus or off-campus housing costs per year.
8. Transportation Costs – average yearly commute expenses for students in the city.
9. Scholarship Availability – percentage of international students who receive scholarships OR highlight popular scholarships available.
10. Total Cost of Study – estimated total of tuition + living + other essential costs per year.
11. University Ranking – most recent QS or THE global ranking.
12. Student Satisfaction Score – out of 100, based on internal surveys or global ratings.
13. Research Quality Rating – based on citation impact or national research assessment score.
14. International Student Ratio – percentage of international students enrolled.
15. Faculty-to-Student Ratio – for example, 1:10, or numeric format.

Instructions:
- If exact data for this university is not available, provide the best possible estimate based on similar universities in the same country, city, or region, or typical values for institutions of this type.
- Use alternative names, spellings, or aliases if known.
- Never return "N/A", "not available", or "no data". Always provide a best-effort estimate or typical value, and clearly indicate if a value is an estimate.
- Return all information in bullet points, with only the main data point (number, percentage, or short phrase) for each indicator.
- Do not include explanations, sentences, or guidance—just the data points.
- Keep the response under 300 words.

University: [NAME]
Country: [COUNTRY]
City: [CITY or REGION, if available]
Also known as: [ALIAS or ALTERNATIVE NAME, if available]`;

export async function POST(req) {
  const body = await req.json();
  const college = body.college;
  const country = body.country || "";
  const city = body.city || "";
  const alias = body.alias || "";
  const phone = body.phone || "";

  // Use phone+college as cache key
  const cacheKey = `metrics:${phone}:${college}`;
  const cached = getCache(cacheKey);
  if (cached) {
    return new Response(JSON.stringify({ metrics: cached }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
  if (!college || typeof college !== 'string') {
    return new Response(JSON.stringify({
      error: 'Missing college name',
      details: 'Please provide a college name in the body.'
    }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
  if (!OPENAI_API_KEY) {
    return new Response(JSON.stringify({
      error: 'Missing OpenAI API key',
      details: 'Make sure OPENAI_API_KEY is defined in your environment variables.'
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
  // Fill in the prompt with available details
  const prompt = IMPROVED_PROMPT
    .replace('[NAME]', college)
    .replace('[COUNTRY]', country)
    .replace('[CITY or REGION, if available]', city)
    .replace('[ALIAS or ALTERNATIVE NAME, if available]', alias);
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
        max_tokens: 700,
        temperature: 0.2,
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
      setCache(cacheKey, resultText, 60 * 60 * 1000);
      return new Response(JSON.stringify({
        metrics: resultText
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
      details: err.name === 'AbortError' ? 'Request timed out after 30s' : String(err)
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
} 