// app/api/get-roi/route.js

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const { setCache, getCache } = require('../cache');

const ROI_PROMPT = `You are a financial analyst specializing in study abroad ROI calculations. 
Given the university name and its financial parameters, calculate the break-even years (time to recover investment).

Calculate ROI using this formula:
Break-even Years = (Total Investment) / (Annual Salary - Annual Living Costs)

Where:
- Total Investment = Tuition Fees + Living Costs for the duration of study
- Annual Salary = Average starting salary after graduation
- Annual Living Costs = Cost of living after graduation (usually 70-80% of student living costs)

Instructions:
- Use realistic estimates based on the university's reputation and location
- Consider the university's ranking and employability data
- Return ONLY the number of years (e.g., "3.2" or "4.1")
- If exact data is unavailable, provide best estimate based on similar universities
- Never return "N/A" or "not available" - always provide a realistic estimate
- Keep response under 50 words

University: [NAME]
Country: [COUNTRY]
City: [CITY, if available]
Tuition Fee: [TUITION]
Living Costs: [LIVING_COSTS]
Average Starting Salary: [SALARY]
University Ranking: [RANKING]
Employment Rate: [EMPLOYMENT_RATE]

Calculate and return only the break-even years:`;

export async function POST(req) {
  const body = await req.json();
  const college = body.college;
  const country = body.country || "";
  const city = body.city || "";
  const tuitionFee = body.tuitionFee || "";
  const livingCosts = body.livingCosts || "";
  const avgSalary = body.avgSalary || "";
  const ranking = body.ranking || "";
  const employmentRate = body.employmentRate || "";
  const phone = body.phone || "";

  // Use phone+college as cache key
  const cacheKey = `roi:${phone}:${college}`;
  const cached = getCache(cacheKey);
  if (cached) {
    return new Response(JSON.stringify({ roi: cached }), { status: 200, headers: { 'Content-Type': 'application/json' } });
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
  const prompt = ROI_PROMPT
    .replace('[NAME]', college)
    .replace('[COUNTRY]', country)
    .replace('[CITY, if available]', city)
    .replace('[TUITION]', tuitionFee)
    .replace('[LIVING_COSTS]', livingCosts)
    .replace('[SALARY]', avgSalary)
    .replace('[RANKING]', ranking)
    .replace('[EMPLOYMENT_RATE]', employmentRate);

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
        max_tokens: 100,
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
      // Extract just the number from the response
      const roiMatch = resultText.match(/(\d+\.?\d*)/);
      let roi = roiMatch ? parseFloat(roiMatch[1]) : 3.5; // Default fallback
      // Enforce a minimum ROI of 2.0 years
      if (roi < 2.0) roi = 2.0;
      // Cache the result for 60 minutes
      setCache(cacheKey, roi, 60 * 60 * 1000);
      return new Response(JSON.stringify({
        roi: roi
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