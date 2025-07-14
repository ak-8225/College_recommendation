// Ensure you have GEMINI_API_KEY set in your herestillstillit is and restart your dev server after any changes.
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
  console.log("Environment variables:", {
    NODE_ENV: process.env.NODE_ENV,
    OPENAI_API_KEY_LENGTH: OPENAI_API_KEY ? OPENAI_API_KEY.length : 0
  });
}

const USP_PROMPT = `
You are a study abroad agent who specialises in answering queries about USP of universities.

Answer based on the following aspects:
1. Campus placement rate based on last year and average package that year (if available).
2. How many Indian students went there last year — how popular is it?
3. Proximity to any flagship geographical areas — that can boost job/internship opportunities.
4. The city where it is located — is that city affordable compared to others in that country?
5. Proximity to most popular cities — how much travel time etc.
6. The latest QS World University Ranking (number only, as a separate bullet point, if available).

Answer everything **very objectively** and in **bullet points**, within **300 words**.

Keep readability **super easy**. Use proper **HTML tags** for formatting.
`;

// --- New: Comparison Metrics Endpoint ---
const COMPARISON_PROMPT = `You are a study abroad data expert specializing in analyzing university metrics for international students. Based on the university name, return accurate, latest available, and structured data for the following indicators:

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

Return all the information in bullet points, within 300 words. Keep language clear and objective, avoid filler text or marketing tone. Only return the data points, no explanation or extra text.`;

// --- New: College Ranking Endpoint ---
const RANKING_PROMPT = `You are a university data expert. Given the name of a university, return ONLY the latest QS World University Ranking (as a number, e.g., 326). Do not include any extra text, explanation, or formatting. If the ranking is not available, return 'N/A'.`;

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const college = searchParams.get('college');
  return await handleUSP(college);
}

export async function POST(req) {
  const body = await req.json();
  if (body.college && body.rankingOnly) {
    // Dedicated ranking endpoint
    return await handleRanking(body.college);
  }
  const college = body.college;
  return await handleUSP(college);
}

async function handleUSP(college) {
  console.log("handleUSP called with college:", college);
  
  if (!college || typeof college !== 'string') {
    console.log("Invalid college parameter:", college);
    return new Response(JSON.stringify({
      error: 'Missing college name',
      details: 'Please provide a college name in the query or body.'
    }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  if (!OPENAI_API_KEY) {
    console.log("Missing OPENAI_API_KEY");
    return new Response(JSON.stringify({
      error: 'Missing OpenAI API key',
      details: 'Make sure OPENAI_API_KEY is defined in your environment variables.'
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  const prompt = `${USP_PROMPT}\n\nUniversity: ${college}`;
  const apiUrl = 'https://api.openai.com/v1/chat/completions';

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout

  try {
    console.log("Making OpenAI API call with prompt:", prompt.substring(0, 100) + "...");
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
    console.log("OpenAI API response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log("OpenAI API error:", errorText);
      return new Response(JSON.stringify({
        error: `OpenAI API request failed with status ${response.status}`,
        details: errorText
      }), { status: response.status, headers: { 'Content-Type': 'application/json' } });
    }

    const data = await response.json();
    console.log("OpenAI API response data:", data);
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
      details: err.name === 'AbortError' ? 'Request to OpenAI API timed out after 30 seconds. Please try again later.' : String(err)
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

async function handleRanking(college) {
  if (!college || typeof college !== 'string') {
    return new Response(JSON.stringify({ error: 'Missing college name' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
  if (!OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: 'Missing OpenAI API key' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
  const prompt = `${RANKING_PROMPT}\n\nUniversity: ${college}`;
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
        temperature: 0,
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: `OpenAI API request failed with status ${response.status}`, details: errorText }), { status: response.status, headers: { 'Content-Type': 'application/json' } });
    }
    const data = await response.json();
    const resultText = data?.choices?.[0]?.message?.content?.trim();
    // Only return the number or N/A
    const match = resultText && resultText.match(/\d{2,4}|N\/A/i);
    return new Response(JSON.stringify({ ranking: match ? match[0] : 'N/A' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal server error', details: err.name === 'AbortError' ? 'Request to OpenAI API timed out after 30 seconds. Please try again later.' : String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
