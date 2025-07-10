import type { NextApiRequest, NextApiResponse } from 'next';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const USP_PROMPT = `You are a study abroad agent who specialise in answering queries about usp of universities. Answer based on below aspects \n 1. Campus Placement rate based on last year and average package that year if available \n 2. How many Indian students went there last year as in how popular is it \n 3. proximity to any flagship geographical areas - which can boost the job/ internship opportunities if I take admission in University in question \n 4. The city where it is located, it that city affordable or not relatively to other cities in that country \n 5. Proximity to most popular cities, how much travel time etc \n Answer everything very objectively and in bullet points within 300 words. Keep readability of text super easy. \n Use proper HTML tags for formatting`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OpenAI API key not set in environment variables.' });
  }
  console.log('OPENAI_API_KEY', OPENAI_API_KEY);

  const college = req.method === 'POST' ? req.body.college : req.query.college;
  if (!college || typeof college !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid college name.' });
  }

  try {
    console.log('OPENAI_API_KEY', OPENAI_API_KEY);
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: `${USP_PROMPT}\n\nUniversity: ${college}` },
        ],
        max_tokens: 600,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(500).json({ error: 'OpenAI API error', details: error });
    }

    const data = await response.json();
    const usps = data.choices?.[0]?.message?.content || '';
    return res.status(200).json({ usps });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch USPs', details: error instanceof Error ? error.message : error });
  }
} 