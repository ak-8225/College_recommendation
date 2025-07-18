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
You are an expert study abroad counselor. For the college and program below, generate exactly 4 short, crisp, India-relevant bullet points (USPs) for Indian students planning to go abroad.

Instructions:
- Each bullet must be a short, direct, actionable phrase (max 12–15 words, no long sentences).
- The first and second points: the most actionable, program/college-specific, India-relevant selling points (e.g., STEM OPT, Indian alumni, city affordability, industry links, etc.).
- The third point: always mention no language barrier for Indian students, but use a short, varied phrase (e.g., 'No language barrier – all courses in English').
- The fourth point: always mention scholarship availability for Indian/international students, with a specific amount/percentage if possible, or a short qualitative statement (e.g., 'Up to ₹10L scholarships for Indian students').
- Do NOT use generic, verbose, or "GPT"-style language. No long sentences. No repetition of employability rate or average salary in the bullets.
- Format as a bulleted list in plain text (no HTML, no extra text).

Input:
College: [COLLEGE_NAME]
Program: [PROGRAM_NAME]
Country: [COUNTRY]
Average Package: [AVG_PACKAGE_FROM_COMPARISON_TABLE]
Graduate Employability Rate: [GRAD_EMPLOYABILITY_RATE_FROM_COMPARISON_TABLE]
(Indicate if this is the highest among compared colleges)
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

const { setCache, getCache } = require('../cache');

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const college = searchParams.get('college');
  const phone = searchParams.get('phone') || "";
  return await handleUSP(college, phone);
}

export async function POST(req) {
  const body = await req.json();
  if (body.college && body.rankingOnly) {
    // Dedicated ranking endpoint
    return await handleRanking(body.college);
  }
  const college = body.college;
  const phone = body.phone || "";
  const program = body.program || "";
  const avgPackage = body.avgPackage || "N/A";
  const employabilityRate = body.employabilityRate || "N/A";
  const isHighestPackage = body.isHighestPackage ? "Yes" : "No";
  const isHighestEmployability = body.isHighestEmployability ? "Yes" : "No";
  return await handleUSP(college, phone, program, avgPackage, employabilityRate, isHighestPackage, isHighestEmployability);
}

// Add auto-select model logic: try GPT-4o, fallback to GPT-3.5-turbo if needed
async function callOpenAIWithAutoSelect(prompt, controller) {
  const apiUrl = 'https://api.openai.com/v1/chat/completions';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
  };
  // Try GPT-4o first
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
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
    if (response.ok) {
      const data = await response.json();
      return { data, model: 'gpt-4o' };
    } else {
      const errorText = await response.text();
      console.log('GPT-4o failed, error:', errorText);
      throw new Error('GPT-4o failed');
    }
  } catch (err) {
    console.log('GPT-4o unavailable, falling back to GPT-3.5-turbo:', err.message);
    // Fallback to GPT-3.5-turbo
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 512,
        temperature: 0.7,
      }),
      signal: controller.signal
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI fallback failed: ${errorText}`);
    }
    const data = await response.json();
    return { data, model: 'gpt-3.5-turbo' };
  }
}

async function handleUSP(college, phone = "", program = "", avgPackage = "N/A", employabilityRate = "N/A", isHighestPackage = "No", isHighestEmployability = "No") {
  console.log("handleUSP called with college:", college);
  // Use phone+college as cache key
  const cacheKey = `usps:${phone}:${college}`;
  const cached = getCache(cacheKey);
  if (cached) {
    return new Response(JSON.stringify({ usps: cached }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
  
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

  // Interpolate the prompt with actual values
  const prompt = USP_PROMPT
    .replace('[COLLEGE_NAME]', college)
    .replace('[PROGRAM_NAME]', program)
    .replace('[COUNTRY]', '') // You can add country if available
    .replace('[AVG_PACKAGE_FROM_COMPARISON_TABLE]', avgPackage)
    .replace('[GRAD_EMPLOYABILITY_RATE_FROM_COMPARISON_TABLE]', employabilityRate)
    .replace('(Indicate if this is the highest among compared colleges)',
      `Highest Avg Package: ${isHighestPackage}. Highest Employability Rate: ${isHighestEmployability}.`);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout
  try {
    console.log("Making OpenAI API call with auto-select model...");
    const { data, model } = await callOpenAIWithAutoSelect(prompt, controller);
    clearTimeout(timeout);
    console.log("OpenAI API response model used:", model);
    const resultText = data?.choices?.[0]?.message?.content;
    if (resultText) {
      setCache(cacheKey, resultText, 60 * 60 * 1000);
      return new Response(JSON.stringify({
        usps: resultText,
        modelUsed: model
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
